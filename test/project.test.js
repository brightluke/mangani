"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { createProject } = require("../src/create-project");
const { loadProject } = require("../src/project");

async function temp(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mangani-project-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

test("loads the canonical MANGANI project config", async (t) => {
  const parent = await temp(t);
  const root = await createProject("demo", { cwd: parent });
  const project = await loadProject({ cwd: root });

  assert.equal(project.config.name, "demo");
  assert.equal(project.entryRelative, path.join("src", "index.html"));
  assert.equal(project.outputRelative, "dist");
});

test("fails cleanly outside a MANGANI project", async (t) => {
  const cwd = await temp(t);
  await assert.rejects(loadProject({ cwd }), /No mangani\.config\.json found/);
});

test("rejects malformed JSON", async (t) => {
  const cwd = await temp(t);
  await fs.writeFile(path.join(cwd, "mangani.config.json"), "{oops", "utf8");
  await assert.rejects(loadProject({ cwd }), /invalid JSON/);
});

test("rejects entry and output paths outside the project", async (t) => {
  const cwd = await temp(t);

  for (const [field, value] of [
    ["entry", "../index.html"],
    ["output", "../dist"]
  ]) {
    const config = { name: "unsafe", entry: "src/index.html", output: "dist" };
    config[field] = value;
    await fs.writeFile(path.join(cwd, "mangani.config.json"), JSON.stringify(config), "utf8");
    await assert.rejects(loadProject({ cwd }), new RegExp(`field "${field}".*inside the project`));
  }
});

test("rejects output inside the source tree", async (t) => {
  const cwd = await temp(t);
  await fs.writeFile(
    path.join(cwd, "mangani.config.json"),
    JSON.stringify({ name: "unsafe", entry: "src/index.html", output: "src/dist" }),
    "utf8"
  );
  await assert.rejects(loadProject({ cwd }), /output.*source directory/);
});
