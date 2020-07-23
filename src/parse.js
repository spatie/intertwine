const { pages } = require("./pages");
const matter = require("gray-matter");
const { arrayWrap, extractMarkdownBlocks, toSlug } = require("./util");

function parse(rawPages) {
  pages.length = 0;

  rawPages
    .map((raw) => {
      const { content, data } = matter(raw.content);

      return updateOrCreate(raw.slug, {
        title: data.title || raw.slug,
        content: content,
        pin: data.pin || false,
        weight: data.weight || null,
        aliases: data.alias !== undefined ? arrayWrap(data.alias) : [],
      });
    })
    .forEach((page) => {
      extractReferences(page.content).forEach((reference) => {
        updateOrCreate(reference.slug, {
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

function updateOrCreate(slug, attributes) {
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
    pin: false,
    weight: null,
    aliases: [],
    references: [],
    ...attributes,
  };

  pages.push(page);

  return page;
}

function extractReferences(content) {
  const blocks = extractMarkdownBlocks(content);
  const references = [];

  blocks.forEach((block) => {
    [...block.matchAll(/\[\[([^\]]+)\]\]/g)].forEach((result) => {
      const slug = toSlug(result[1]);

      references.push({
        title: result[1],
        slug,
        content: block,
      });
    });
  });

  return references;
}

module.exports.parse = parse;
