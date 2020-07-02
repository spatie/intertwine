#!/usr/bin/env node

const path = require("path");
const fs = require("fs").promises;
const _ = require("lodash");
const matter = require("gray-matter");
const markdown = require("markdown-it")();
const rimraf = require("rimraf");
const cheerio = require("cheerio");

build();

async function findFiles(directory = ".") {
  const directoryEntries = await fs.readdir(directory, { withFileTypes: true });

  const paths = await Promise.all(
    directoryEntries.map((directoryEntry) => {
      const resolvedPath = path.resolve(directory, directoryEntry.name);

      if (directoryEntry.isDirectory()) {
        return findFiles(resolvedPath);
      }

      if (resolvedPath.endsWith(".md")) {
        return {
          path: resolvedPath,
          slug: directoryEntry.name.replace(".md", ""),
        };
      }

      return [];
    })
  );

  return Array.prototype.concat(...paths);
}

async function scan(directory = ".") {
  const pages = await Promise.all(
    (await findFiles(directory)).map(async ({ path, slug }) => {
      const { content, data } = matter(await fs.readFile(path, "utf-8"));

      const title = data.title || slug;

      const aliases = (() => {
        if (Array.isArray(data.alias)) {
          return data.alias;
        }

        if (!data.alias) {
          return [];
        }

        return [data.alias];
      })();

      const references = [...content.matchAll(/\[\[([^\]]+)\]\]/g)].map(
        (result) => result[1]
      );

      return { content, title, slug, aliases, references };
    })
  );

  _.uniq(pages.flatMap((page) => page.references)).forEach((reference) => {
    const slug = _.kebabCase(reference.toLowerCase());
    const page = pages.find(
      (page) => page.slug === slug || page.aliases.includes(slug)
    );

    if (!page) {
      pages.push({
        content: "",
        title: reference,
        slug,
        aliases: [],
        references: [],
      });
    }
  });

  return pages;
}

async function build() {
  const pages = await scan();

  await new Promise((resolve) => rimraf("./public", resolve));
  await fs.mkdir("./public");

  pages.forEach((page) => {
    fs.writeFile(`./public/${page.slug}.html`, renderPage(page, pages));
  });
}

function renderPage(page, pages) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.title}</title>
      </head>
      <body>
        <h1>${page.title}</h1>
        ${linkifyReferences(markdown.render(page.content))}
        ${renderLinkedReferences(page, pages)}
      </body>
    </html>
  `;
}

function linkifyReferences(html) {
  return html.replace(/\[\[([^\]]+)\]\]/g, (_result, contents) => {
    const slug = _.kebabCase(contents.toLowerCase());

    return `<a href="/${slug}">${contents}</a>`;
  });
}

function renderLinkedReferences(subject, pages) {
  const linkedReferences = pages
    .map((page) => {
      const $ = cheerio.load(markdown.render(page.content));

      const blocks = $("p")
        .filter((_, element) => {
          return $(element)
            .text()
            .match(new RegExp(`\\[\\[${subject.title}\\]\\]`, "i"));
        })
        .map((_, block) => {
          return $.html(block);
        })
        .toArray();

      return { page, blocks };
    })
    .filter(({ blocks }) => {
      return blocks.length > 0;
    });

  const count = linkedReferences.reduce(
    (sum, { blocks }) => sum + blocks.length,
    0
  );

  if (!count) {
    return "";
  }

  return `
    <h2>
      ${count} Linked Reference${count === 1 ? "" : "s"}
    </h2>
    <ul>
      ${linkedReferences
        .map(
          ({ page, blocks }) => `
          <li>
            <a href="/${page.slug}">
              ${page.title}
            </a>
            <ul>
              ${blocks
                .map((block) => `<li>${linkifyReferences(block)}</li>`)
                .join("")}
            </ul>
          </li>
        `
        )
        .join("")}
    </ul>
  `;
}
