import path from "path";
import nunjucks from "nunjucks";
import { markdown } from "./util";

const renderer = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([
    "templates",
    path.resolve(__dirname, "../templates"),
  ])
);

renderer.addFilter("markdown", markdown);

export function render(page, site) {
  return renderer.render("page.html", { page, site });
}
