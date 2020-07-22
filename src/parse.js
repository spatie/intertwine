const matter = require("gray-matter");
const markdownIt = require("markdown-it")();
const slugify = require("@sindresorhus/slugify");
const { arrayWrap } = require("./util");

function parse(files) {
  const pages = [];

  function updateOrCreatePage(slug, attributes) {
    let page = pages.find((page) => {
      return page.slug === slug || page.aliases.includes(slug);
    });

    if (page) {
      Object.assign(page, attributes);

      return page;
    }

    page = {
      title: slug,
      content: "",
      slug,
      url: slug === "index" ? "/" : `/${slug}`,
      pin: false,
      weight: null,
      aliases: [],
      references: [],
      ...attributes,
    };

    pages.push(page);

    return page;
  }

  files
    .map(({ filename, contents }) => {
      const { content, data } = matter(contents);

      return updateOrCreatePage(filename, {
        title: data.title || filename,
        content: content,
        pin: data.pin || false,
        weight: data.weight || null,
        aliases: data.alias !== undefined ? arrayWrap(data.alias) : [],
      });
    })
    .forEach((page) => {
      extractReferences(page.content).forEach((reference) => {
        updateOrCreatePage(reference.slug, {
          title: reference.title,
        }).references.push({
          title: page.title,
          slug: page.slug,
          url: page.slug === "index" ? "/" : `/${page.slug}`,
          content: reference.content,
        });
      });
    });

  return pages;
}

function slug(string) {
  return slugify(string, { decamelize: false });
}

function extractReferences(content) {
  const tokens = markdownIt.parse(content, {});
  const references = [];

  tokens.forEach((token) => {
    [...token.content.matchAll(/\[\[([^\]]+)\]\]/g)].forEach((result) => {
      references.push({
        title: result[1],
        slug: slug(result[1]),
        content: token.content,
      });
    });
  });

  return references;
}

module.exports.parse = parse;
module.exports.slug = slug;
