const {
  copy,
  directoryExists,
  find,
  freshDirectory,
  write,
} = require("./file");
const { parse } = require("./parse");
const { render } = require("./render");
const { orderBy } = require("./util");

async function build() {
  await freshDirectory("./public");

  await Promise.all([buildPages(), buildAssets()]);
}

async function buildAssets() {
  if (!(await directoryExists("./assets"))) {
    return;
  }

  return copy("./assets", "./public/assets");
}

async function buildPages() {
  const rawPages = (await find("./pages")).map((file) => ({
    slug: file.filename,
    content: file.content,
  }));

  const pages = parse(rawPages);

  const indexPage = pages.find((page) => page.slug === "index");
  const title = indexPage ? indexPage.title : "Intertwine";

  const sidebar = orderBy(
    pages.filter((page) => page.pin),
    ["weight", "title"]
  );

  return write(
    pages.map((page) => ({
      filename:
        page.slug === "index" ? "index.html" : `${page.slug}/index.html`,
      content: render(page, { pages, sidebar, title }),
    })),
    "./public"
  );
}

module.exports.build = build;
module.exports.buildAssets = buildAssets;
module.exports.buildPages = buildPages;
