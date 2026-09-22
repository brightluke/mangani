"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { run } = require("../src/cli");
const { createProject } = require("../src/create-project");
const {
  generate,
  validateGeneratorName,
  validateGeneratorType
} = require("../src/generate");

async function temp(t) {
  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), "mangani-generate-")
  );
  t.after(() =>
    fs.rm(dir, { recursive: true, force: true })
  );
  return dir;
}

test("validates generator types and names", () => {
  assert.equal(validateGeneratorType("page"), "page");
  assert.equal(validateGeneratorType("component"), "component");

  assert.throws(
    () => validateGeneratorType("widget"),
    /page.*component/
  );

  for (const name of [
    "",
    ".",
    "..",
    "../escape",
    "nested/path",
    "/absolute",
    "name with spaces"
  ]) {
    assert.throws(
      () => validateGeneratorName(name),
      /Generator name/
    );
  }
});

test("generates a page inside the source tree", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("site", { cwd: parent });

  const result = await generate("page", "about", { cwd });

  assert.equal(
    result.relativePath,
    path.join("src", "pages", "about")
  );

  const expected = [
    "index.html",
    "styles.css",
    "app.js"
  ];

  for (const file of expected) {
    const stat = await fs.stat(
      path.join(cwd, "src", "pages", "about", file)
    );
    assert.equal(stat.isFile(), true);
  }

  const html = await fs.readFile(
    path.join(
      cwd,
      "src",
      "pages",
      "about",
      "index.html"
    ),
    "utf8"
  );

  assert.match(html, /About/);
});

test("generates a component inside the source tree", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("site", { cwd: parent });

  const result = await generate(
    "component",
    "navbar",
    { cwd }
  );

  assert.equal(
    result.relativePath,
    path.join("src", "components", "navbar")
  );

  for (const file of [
    "navbar.html",
    "navbar.css",
    "navbar.js"
  ]) {
    const stat = await fs.stat(
      path.join(
        cwd,
        "src",
        "components",
        "navbar",
        file
      )
    );
    assert.equal(stat.isFile(), true);
  }
});

test("refuses to overwrite an existing generator target", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("site", { cwd: parent });

  await generate("page", "about", { cwd });

  await assert.rejects(
    generate("page", "about", { cwd }),
    /Refusing to overwrite/
  );
});

test("generate command reports the generated structure", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("site", { cwd: parent });

  const out = [];
  const errors = [];

  const code = await run(
    ["generate", "component", "card"],
    {
      out: (message) => out.push(message),
      error: (message) => errors.push(message)
    },
    { cwd }
  );

  assert.equal(code, 0);
  assert.match(
    out.join("\n"),
    /Generated component card/
  );
  assert.match(
    out.join("\n"),
    /src.*components.*card/
  );
  assert.deepEqual(errors, []);
});

test("generate command rejects incomplete usage", async () => {
  const out = [];
  const errors = [];

  const code = await run(
    ["generate", "page"],
    {
      out: (message) => out.push(message),
      error: (message) => errors.push(message)
    }
  );

  assert.equal(code, 1);
  assert.match(
    errors.join("\n"),
    /Usage: mangani generate/
  );
});
