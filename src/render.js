const { slug } = require("./parse");
const markdownIt = require("markdown-it")({ html: true });

const render = (page) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
  </head>
  <body>
    <h1>${page.title}</h1>
    ${markdown(page.content)}
    ${
      page.references.length
        ? `
          <h2>
            ${page.references.length}
            Linked
            ${page.references.length === 1 ? "Reference" : "References"}
          </h2>
          <ul>
            ${page.references
              .map(
                (reference) => `
                  <li>
                    <a href="/${
                      reference.slug === "index" ? "" : reference.slug
                    }">
                      ${reference.title}
                    </a>
                    <ul>
                      <li>${markdown(reference.content)}</li>
                    </ul>
                  </li>
                `
              )
              .join("")}
          </ul>
          `
        : ""
    }
  </body>
</html>
`;

function markdown(input) {
  input = input.replace(/\[\[([^\]]+)\]\]/g, (_, contents) => {
    return `<a href="/${slug(contents)}">${contents}</a>`;
  });

  return markdownIt.render(input);
}

module.exports.render = render;
