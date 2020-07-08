const fs = require("fs").promises;
const path = require("path");
const rimraf = require("rimraf");
const recursiveCopy = require("recursive-copy");

async function copy(source, destination) {
  await recursiveCopy(source, destination, { overwrite: true });
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

async function freshDir(directory) {
  await new Promise((resolve) => rimraf(directory, resolve));

  await fs.mkdir(directory);
}

function write(files, outDir) {
  return Promise.all(
    files.map(async (file) => {
      const filePath = `${outDir}/${file.filename}`;

      await ensureDirectoryExists(filePath);

      return fs.writeFile(filePath, file.contents);
    })
  );
}

async function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);

  return fs.stat(dirname).catch(() => {
    ensureDirectoryExists(dirname);

    return fs.mkdir(dirname);
  });
}

module.exports.copy = copy;
module.exports.find = find;
module.exports.freshDir = freshDir;
module.exports.write = write;
