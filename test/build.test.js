"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { BUILD_MARKER, buildProject } = require("../src/build-project");
const { run } = require("../src/cli");
const { createProject } = require("../src/create-project");

async function temp(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mangani-build-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

test("build creates static output, nested assets and ownership marker", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("built", { cwd: parent });
  await fs.mkdir(path.join(cwd, "src", "assets"));
  await fs.writeFile(path.join(cwd, "src", "assets", "data.txt"), "payload", "utf8");

  const result = await buildProject({ cwd });
  assert.equal(result.project, "built");
  assert.equal(await fs.readFile(path.join(cwd, "dist", "assets", "data.txt"), "utf8"), "payload");

  const marker = JSON.parse(await fs.readFile(path.join(cwd, "dist", BUILD_MARKER), "utf8"));
  assert.deepEqual(marker, { generatedBy: "MANGANI", project: "built" });
});

test("build safely replaces an existing MANGANI-owned output", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("rebuilt", { cwd: parent });

  await buildProject({ cwd });
  await fs.writeFile(path.join(cwd, "src", "new.txt"), "v2", "utf8");
  await fs.writeFile(path.join(cwd, "dist", "old.txt"), "remove-me", "utf8");
  await buildProject({ cwd });

  assert.equal(await fs.readFile(path.join(cwd, "dist", "new.txt"), "utf8"), "v2");
  await assert.rejects(fs.access(path.join(cwd, "dist", "old.txt")), /ENOENT/);
});

test("build refuses to overwrite an unowned output directory", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("protected", { cwd: parent });
  await fs.mkdir(path.join(cwd, "dist"));
  await fs.writeFile(path.join(cwd, "dist", "keep.txt"), "keep", "utf8");

  await assert.rejects(buildProject({ cwd }), /Refusing to overwrite unowned output directory/);
  assert.equal(await fs.readFile(path.join(cwd, "dist", "keep.txt"), "utf8"), "keep");
});

test("build refuses to overwrite an existing file at the output path", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("protected-file", { cwd: parent });
  await fs.writeFile(path.join(cwd, "dist"), "keep", "utf8");

  await assert.rejects(buildProject({ cwd }), /Refusing to overwrite existing non-directory output/);
  assert.equal(await fs.readFile(path.join(cwd, "dist"), "utf8"), "keep");
});

test("build CLI reports successful output", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("cli-build", { cwd: parent });
  const out = [];
  const errors = [];

  const code = await run(["build"], {
    out: (message) => out.push(message),
    error: (message) => errors.push(message)
  }, { cwd });

  assert.equal(code, 0);
  assert.match(out.join("\n"), /Built cli-build/);
  assert.match(out.join("\n"), /Build complete/);
  assert.deepEqual(errors, []);
});
