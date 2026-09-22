"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { buildProject } = require("../src/build-project");
const { run } = require("../src/cli");
const { createProject } = require("../src/create-project");
const { startDevServer } = require("../src/dev-server");
const {
  DEFAULT_TEMPLATE,
  createTemplate,
  getTemplate,
  hasTemplate,
  listTemplates
} = require("../src/templates");

async function temp(t) {
  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), "mangani-template-")
  );
  t.after(() =>
    fs.rm(dir, { recursive: true, force: true })
  );
  return dir;
}

function request(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          resolve({
            status: response.statusCode,
            body: Buffer.concat(chunks).toString("utf8")
          })
        );
      })
      .on("error", reject);
  });
}

test("registry exposes only basic and dashboard", () => {
  assert.equal(DEFAULT_TEMPLATE, "basic");
  assert.deepEqual(listTemplates(), ["basic", "dashboard"]);
  assert.equal(hasTemplate("basic"), true);
  assert.equal(hasTemplate("dashboard"), true);
  assert.equal(hasTemplate("react"), false);
  assert.equal(typeof getTemplate("basic"), "function");
});

test("unknown templates fail with available choices", () => {
  assert.throws(
    () => getTemplate("react"),
    /Unknown template "react".*basic, dashboard/
  );
});

test("default creation is equivalent to explicit basic", async (t) => {
  const parent = await temp(t);
  const implicit = await createProject("implicit", { cwd: parent });
  const explicit = await createProject("explicit", {
    cwd: parent,
    template: "basic"
  });

  const implicitConfig = JSON.parse(
    await fs.readFile(
      path.join(implicit, "mangani.config.json"),
      "utf8"
    )
  );
  const explicitConfig = JSON.parse(
    await fs.readFile(
      path.join(explicit, "mangani.config.json"),
      "utf8"
    )
  );

  assert.equal(implicitConfig.template, "basic");
  assert.equal(explicitConfig.template, "basic");

  const implicitFiles = Object.keys(createTemplate("implicit", "basic"));
  const explicitFiles = Object.keys(createTemplate("explicit", "basic"));
  assert.deepEqual(implicitFiles, explicitFiles);
});

test("dashboard template creates a distinct offline project", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("ops-panel", {
    cwd: parent,
    template: "dashboard"
  });

  const expectedFiles = [
    "README.md",
    "mangani.config.json",
    "src/index.html",
    "src/styles.css",
    "src/app.js",
    "src/components/status-card/status-card.js"
  ];

  for (const file of expectedFiles) {
    const stat = await fs.stat(path.join(cwd, file));
    assert.equal(stat.isFile(), true, file);
  }

  const config = JSON.parse(
    await fs.readFile(
      path.join(cwd, "mangani.config.json"),
      "utf8"
    )
  );
  assert.equal(config.template, "dashboard");

  const combined = await Promise.all(
    expectedFiles
      .filter((file) => !file.endsWith(".json"))
      .map((file) =>
        fs.readFile(path.join(cwd, file), "utf8")
      )
  );
  assert.doesNotMatch(combined.join("\n"), /https?:\/\//);
});

test("create CLI accepts --template and rejects unknown templates", async (t) => {
  const parent = await temp(t);
  const out = [];
  const errors = [];

  const code = await run(
    ["create", "dash", "--template", "dashboard"],
    {
      out: (message) => out.push(message),
      error: (message) => errors.push(message)
    },
    { cwd: parent }
  );

  assert.equal(code, 0);
  assert.match(out.join("\n"), /Template: dashboard/);
  assert.deepEqual(errors, []);

  const bad = [];
  const badCode = await run(
    ["create", "bad", "--template", "react"],
    {
      out: () => {},
      error: (message) => bad.push(message)
    },
    { cwd: parent }
  );

  assert.equal(badCode, 1);
  assert.match(bad.join("\n"), /Unknown template "react"/);
});

test("dashboard works with dev and build", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("dashboard-app", {
    cwd: parent,
    template: "dashboard"
  });

  const running = await startDevServer({ cwd, port: 0 });
  t.after(() => running.close());

  const page = await request(running.url);
  assert.equal(page.status, 200);
  assert.match(page.body, /MANGANI DASHBOARD/);

  await running.close();
  const result = await buildProject({ cwd });

  assert.equal(result.project, "dashboard-app");
  const built = await fs.readFile(
    path.join(cwd, "dist", "index.html"),
    "utf8"
  );
  assert.match(built, /MANGANI DASHBOARD/);
});

test("legacy configs without template remain loadable through existing commands", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("legacy-shape", { cwd: parent });

  const configPath = path.join(cwd, "mangani.config.json");
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  delete config.template;
  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n");

  const result = await buildProject({ cwd });
  assert.equal(result.project, "legacy-shape");
});
