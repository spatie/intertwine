const path = require("path");
const nunjucks = require("nunjucks");
const { markdown } = require("./util");

const renderer = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([
    "templates",
    path.resolve(__dirname, "../templates"),
  ])
);

renderer.addFilter("markdown", markdown);

function render(page, site) {
  return renderer.render("page.html", { page, site });
}

module.exports.render = render;
