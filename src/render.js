const path = require("path");
const { slug } = require("./parse");
const markdownIt = require("markdown-it")({ html: true });
const nunjucks = require("nunjucks");

const renderer = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(["views", path.resolve(__dirname, "../views")])
);

renderer.addFilter("markdown", markdown);

function render(page) {
  return renderer.render("page.html", page);
}

function markdown(input) {
  input = input.replace(/\[\[([^\]]+)\]\]/g, (_, contents) => {
    return `<a href="/${slug(contents)}">${contents}</a>`;
  });

  return markdownIt.render(input);
}

module.exports.render = render;
