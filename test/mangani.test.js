"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const packageInfo = require("../package.json");
const { run } = require("../src/cli");
const {
  createProject,
  validateProjectName
} = require("../src/create-project");

async function temporaryDirectory(t) {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "mangani-")
  );
  t.after(() =>
    fs.rm(directory, { recursive: true, force: true })
  );
  return directory;
}

function captureIO() {
  const out = [];
  const errors = [];

  return {
    io: {
      out: (message) => out.push(message),
      error: (message) => errors.push(message)
    },
    out,
    errors
  };
}

test("exports the MANGANI package identity", () => {
  assert.equal(packageInfo.name, "@bmk24/mangani");
  assert.equal(packageInfo.version, "0.3.0");
  assert.equal(packageInfo.bin.mangani, "./bin/mangani.js");
});

test("prints help and version", async () => {
  const help = captureIO();
  assert.equal(await run(["--help"], help.io), 0);
  assert.match(
    help.out.join("\n"),
    /Build here\. Build with less\./
  );
  assert.match(help.out.join("\n"), /live-reload/);

  const version = captureIO();
  assert.equal(await run(["--version"], version.io), 0);
  assert.deepEqual(version.out, ["0.3.0"]);
});

test("creates a complete offline starter", async (t) => {
  const cwd = await temporaryDirectory(t);
  const projectPath = await createProject(
    "kit00-dashboard",
    { cwd }
  );

  const expectedFiles = [
    "README.md",
    "mangani.config.json",
    "src/app.js",
    "src/index.html",
    "src/styles.css"
  ];

  for (const file of expectedFiles) {
    const stat = await fs.stat(
      path.join(projectPath, file)
    );
    assert.equal(stat.isFile(), true, file);
  }

  const html = await fs.readFile(
    path.join(projectPath, "src/index.html"),
    "utf8"
  );

  assert.match(html, /Kit00 Dashboard/);
  assert.doesNotMatch(html, /https?:\/\//);
});

test("create command reports the generated project", async (t) => {
  const cwd = await temporaryDirectory(t);
  const capture = captureIO();

  assert.equal(
    await run(
      ["create", "first-build"],
      capture.io,
      { cwd }
    ),
    0
  );

  assert.match(
    capture.out.join("\n"),
    /Created first-build/
  );
  assert.deepEqual(capture.errors, []);
});

test("rejects unsafe project names", () => {
  const unsafeNames = [
    "",
    ".",
    "..",
    "../escape",
    "nested/project",
    "/absolute",
    "name with spaces",
    ";touch-owned"
  ];

  for (const name of unsafeNames) {
    assert.throws(
      () => validateProjectName(name),
      /Project name/
    );
  }
});

test("does not overwrite an existing path", async (t) => {
  const cwd = await temporaryDirectory(t);
  const existing = path.join(cwd, "existing");

  await fs.mkdir(existing);
  await fs.writeFile(
    path.join(existing, "keep.txt"),
    "keep"
  );

  await assert.rejects(
    createProject("existing", { cwd }),
    /already exists/
  );

  assert.equal(
    await fs.readFile(
      path.join(existing, "keep.txt"),
      "utf8"
    ),
    "keep"
  );
});

test("returns an error for unknown commands", async () => {
  const capture = captureIO();

  assert.equal(
    await run(["deploy"], capture.io),
    1
  );

  assert.match(
    capture.errors.join("\n"),
    /Unknown command: deploy/
  );
});
