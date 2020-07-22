const path = require("path");
const { slug } = require("./parse");
const markdownIt = require("markdown-it")({ html: true });
const nunjucks = require("nunjucks");
const { orderBy } = require("lodash");

const renderer = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([
    "templates",
    path.resolve(__dirname, "../templates"),
  ])
);

renderer.addFilter("markdown", markdown);

function render(page, pages) {
  const index = pages.find((page) => page.slug === "index");
  const title = index ? index.title : "Intertwine";
  const sidebar = orderBy(
    pages.filter((page) => page.pin),
    ["weight", "title"]
  );

  return renderer.render("page.html", { page, pages, title, sidebar });
}

function markdown(input) {
  input = input.replace(/\[\[([^\]]+)\]\]/g, (_, contents) => {
    return `<a href="/${slug(contents)}" class="reference">${contents}</a>`;
  });

  return markdownIt.render(input);
}

module.exports.render = render;
