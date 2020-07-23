const { pages } = require("./pages");
const MarkdownIt = require("markdown-it");
const { debounce, orderBy } = require("lodash");
const slugify = require("@sindresorhus/slugify");

function arrayWrap(item) {
  return Array.isArray(item) ? item : [item];
}

const markdownIt = MarkdownIt({ html: true });

function markdown(input) {
  input = input.replace(/\[\[([^\]]+)\]\]/g, (_, content) => {
    return `<a href="/${toUrl(content)}" class="reference">${content}</a>`;
  });

  return markdownIt.render(input);
}

function extractMarkdownBlocks(input) {
  return markdownIt.parse(input, {}).map((token) => token.content);
}

function toSlug(string) {
  return slugify(string, { decamelize: false });
}

function toUrl(slug) {
  if (slug === "index") {
    return "/";
  }

  const alias = pages.find((page) => {
    return page.aliases.includes(slug);
  });

  if (alias) {
    return slug === "index" ? "/" : `${alias.slug}`;
  }

  return `/${slug}`;
}

async function perf(callback) {
  const hrstart = process.hrtime();

  await callback();

  const hrend = process.hrtime(hrstart);

  return Math.round(hrend[0] * 1000 + hrend[1] / 1000000);
}

module.exports.arrayWrap = arrayWrap;
module.exports.debounce = debounce;
module.exports.extractMarkdownBlocks = extractMarkdownBlocks;
module.exports.markdown = markdown;
module.exports.perf = perf;
module.exports.orderBy = orderBy;
module.exports.toSlug = toSlug;
module.exports.toUrl = toUrl;
