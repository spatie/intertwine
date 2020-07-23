#!/usr/bin/env node

const { debounce, perf } = require("./util");
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
      error(`Unknown command: ${process.argv[2]}`);
  }
})();

const bs = require("browser-sync").create();

async function watch() {
  await build();

  bs.watch(
    "pages",
    debounce(async (event) => {
      const time = await perf(buildPages);

      if (event !== "add") {
        info(`Pages built in ${time}ms`);
      }
    }, 100)
  );

  bs.watch(
    "assets",
    debounce(async (event) => {
      const time = await perf(buildAssets);

      if (event !== "add") {
        info(`Assets copied in ${time}ms`);
      }
    }, 100)
  );

  info("Listening for changes…");
}

async function serve() {
  await watch();

  bs.init({
    server: "public",
    files: "public/**/*",
    open: false,
    watch: true,
    notify: false,
    logLevel: "silent",
  });

  info("Server is available at http://localhost:3000…");
}

function error(error) {
  console.log(`\x1b[37m\x1b[41m[Intertwine]\x1b[0m ${error}`);
}

function info(info) {
  console.log(`\x1b[35m[Intertwine]\x1b[0m ${info}`);
}
