const fs = require("fs").promises;
const path = require("path");
const rimraf = require("rimraf");
const recursiveCopy = require("recursive-copy");

async function clean(directory) {
  await new Promise((resolve) => rimraf(directory, resolve));
  await fs.mkdir(directory);
}

async function copy(source, destination) {
  await recursiveCopy(source, destination);
}

async function find(directory = ".") {
  const directoryEntries = await fs.readdir(directory, { withFileTypes: true });

  const paths = await Promise.all(
    directoryEntries.map(async (directoryEntry) => {
      const resolvedPath = path.resolve(directory, directoryEntry.name);

      if (directoryEntry.isDirectory()) {
        return find(resolvedPath);
      }

      if (resolvedPath.endsWith(".md")) {
        return {
          filename: directoryEntry.name.replace(".md", ""),
          contents: await fs.readFile(resolvedPath, "utf-8"),
        };
      }

      return [];
    })
  );

  return Array.prototype.concat(...paths);
}

function write(files, outDir) {
  return Promise.all(
    files.map((file) => {
      return fs.writeFile(`${outDir}/${file.filename}`, file.contents);
    })
  );
}

module.exports.clean = clean;
module.exports.copy = copy;
module.exports.find = find;
module.exports.write = write;
