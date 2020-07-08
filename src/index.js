#!/usr/bin/env node

const { freshDir, copy, find, write } = require("./file");
const { parse } = require("./parse");
const { render } = require("./render");
const { debounce } = require("lodash");

(function () {
  switch (process.argv[2]) {
    case "serve":
      serve();
      break;
    case "watch":
      watch();
      break;
    case "build":
    case undefined:
      build();
      break;
    default:
      console.error(`Unknown command: ${process.argv[2]}`);
  }
})();

async function build() {
  await clean();

  await Promise.all([pages(), assets()]);
}

async function watch() {
  await build();

  const chokidar = require("chokidar");

  chokidar.watch("./pages").on(
    "all",
    debounce(async () => {
      await pages();
      console.log("Updated pages");
    }, 100)
  );

  chokidar.watch("./assets").on(
    "all",
    debounce(async () => {
      await assets();
      console.log("Updated assets");
    }, 100)
  );

  console.log("Watching for changes…");
}

async function serve() {
  await watch();

  const browserSync = require("browser-sync");

  browserSync.create().init({
    server: {
      baseDir: "public",
    },
    port: 8080,
    ignore: ["node_modules"],
    watch: true,
    open: false,
    notify: false,
    index: "index.html",
  });
}

function clean() {
  return freshDir("./public");
}

async function pages() {
  const pages = parse(await find("./pages"));

  return write(
    pages.map((page) => ({
      filename:
        page.slug === "index" ? "index.html" : `${page.slug}/index.html`,
      contents: render(page),
    })),
    "./public"
  );
}

function assets() {
  return copy("./assets", "./public/assets");
}
