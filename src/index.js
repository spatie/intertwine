#!/usr/bin/env node

const { debounce } = require("./util");
const { build, buildAssets, buildPages } = require("./build");

(function () {
  switch (process.argv[2]) {
    case "build":
    case undefined:
      build();
      break;
    case "serve":
      serve();
      break;
    case "watch":
      watch();
      break;
    default:
      console.error(`Unknown command: ${process.argv[2]}`);
  }
})();

async function watch() {
  await build();

  const chokidar = require("chokidar");

  chokidar.watch("./pages").on(
    "all",
    debounce(async () => {
      await buildPages();
      console.log("Updated pages");
    }, 100)
  );

  chokidar.watch("./assets").on(
    "all",
    debounce(async () => {
      await buildAssets();
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
