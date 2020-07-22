const path = require("path");
const { slug } = require("./parse");
const markdownIt = require("markdown-it")({ html: true });
const nunjucks = require("nunjucks");

const renderer = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([
    "templates",
    path.resolve(__dirname, "../templates"),
  ])
);

renderer.addFilter("markdown", markdown);

function render(page, pages) {
  const sidebar = pages.filter((page) => page.pin);

  return renderer.render("page.html", { page, pages, sidebar });
}

function markdown(input) {
  input = input.replace(/\[\[([^\]]+)\]\]/g, (_, contents) => {
    return `<a href="/${slug(contents)}" class="reference">${contents}</a>`;
  });

  return markdownIt.render(input);
}

module.exports.render = render;
