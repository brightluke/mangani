"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const { loadProject } = require("./project");
const { titleFromName } = require("./template");

const VALID_GENERATOR_NAME = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const GENERATOR_TYPES = new Set(["page", "component"]);

function validateGeneratorType(type) {
  if (!GENERATOR_TYPES.has(type)) {
    throw new Error('Generator type must be "page" or "component".');
  }

  return type;
}

function validateGeneratorName(name) {
  if (typeof name !== "string" || name.length === 0) {
    throw new Error("Generator name is required.");
  }

  if (name.length > 64) {
    throw new Error(
      "Generator name must contain 64 characters or fewer."
    );
  }

  if (
    !VALID_GENERATOR_NAME.test(name) ||
    name === "." ||
    name === ".."
  ) {
    throw new Error(
      "Generator name may contain letters, numbers, hyphens and underscores, and must start with a letter or number."
    );
  }

  return name;
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function pageTemplate(name) {
  const title = titleFromName(name);

  return {
    "index.html": `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <main class="page">
    <h1>${title}</h1>
    <p>Generated with MANGANI.</p>
  </main>
  <script src="./app.js"></script>
</body>
</html>
`,
    "styles.css": `.page {
  width: min(48rem, calc(100% - 2rem));
  margin: 4rem auto;
}
`,
    "app.js": `"use strict";

// BMK24: page behavior starts here.
`
  };
}

function componentTemplate(name) {
  const title = titleFromName(name);

  return {
    [`${name}.html`]: `<section class="${name}" data-component="${name}">
  <h2>${title}</h2>
</section>
`,
    [`${name}.css`]: `.${name} {
  display: block;
}
`,
    [`${name}.js`]: `"use strict";

// BMK24: ${title} component behavior starts here.
`
  };
}

function generatorTemplate(type, name) {
  if (type === "page") return pageTemplate(name);
  if (type === "component") return componentTemplate(name);
  throw new Error(`Unsupported generator type: ${type}`);
}

async function generate(type, name, options = {}) {
  validateGeneratorType(type);
  validateGeneratorName(name);

  const project = await loadProject({
    cwd: options.cwd || process.cwd()
  });

  const collection =
    type === "page" ? "pages" : "components";

  const targetPath = path.join(
    project.sourcePath,
    collection,
    name
  );

  if (await pathExists(targetPath)) {
    throw new Error(
      `Refusing to overwrite existing ${type}: ${path.join(collection, name)}`
    );
  }

  await fs.mkdir(targetPath, { recursive: true });

  try {
    const files = generatorTemplate(type, name);

    for (const [fileName, content] of Object.entries(files)) {
      await fs.writeFile(
        path.join(targetPath, fileName),
        content,
        {
          encoding: "utf8",
          flag: "wx"
        }
      );
    }
  } catch (error) {
    await fs.rm(targetPath, {
      recursive: true,
      force: true
    });
    throw error;
  }

  return {
    type,
    name,
    path: targetPath,
    relativePath: path.relative(
      project.root,
      targetPath
    ),
    files: Object.keys(
      generatorTemplate(type, name)
    )
  };
}

module.exports = {
  GENERATOR_TYPES,
  componentTemplate,
  generate,
  generatorTemplate,
  pageTemplate,
  validateGeneratorName,
  validateGeneratorType
};
