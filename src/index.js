#!/usr/bin/env node

const { clean, find, write } = require("./file");
const { parse } = require("./parse");
const { render } = require("./render");

(async function build() {
  const pages = parse(await find("."));

  await clean("./public");

  await write(
    pages.map((page) => ({
      filename: `${page.slug}.html`,
      contents: render(page),
    })),
    "./public"
  );
})();
