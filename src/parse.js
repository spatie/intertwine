const matter = require("gray-matter");
const markdownIt = require("markdown-it")();
const slugify = require("@sindresorhus/slugify");

function parse(files) {
  const pages = [];

  function findOrCreatePage(slug, attributes) {
    let page = pages.find((page) => page.slug === slug);

    if (page) {
      return page;
    }

    page = {
      title: slug,
      content: "",
      slug,
      references: [],
      ...attributes,
    };

    pages.push(page);

    return page;
  }

  files.forEach(({ filename, contents }) => {
    const { content, data } = matter(contents);

    const page = findOrCreatePage(filename);

    page.title = data.title || filename;
    page.content = content;

    extractReferences(content).forEach((reference) => {
      findOrCreatePage(reference.slug, {
        title: reference.title,
      }).references.push({
        title: page.title,
        slug: page.slug,
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
