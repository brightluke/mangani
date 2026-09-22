"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { run } = require("../src/cli");
const { createProject } = require("../src/create-project");
const { parsePort, startDevServer } = require("../src/dev-server");

async function temp(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mangani-dev-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

function request(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({
        status: response.statusCode,
        type: response.headers["content-type"],
        body: Buffer.concat(chunks).toString("utf8")
      }));
    }).on("error", reject);
  });
}

test("validates custom development ports", () => {
  assert.equal(parsePort("4000"), 4000);
  for (const value of ["0", "65536", "abc", "3.14", ""]) {
    assert.throws(() => parsePort(value), /Port must be an integer/);
  }
});

test("serves HTML, CSS and JavaScript and returns 404 for missing files", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("served", { cwd: parent });
  await fs.mkdir(path.join(cwd, "src", "assets"));
  await fs.writeFile(path.join(cwd, "src", "assets", "note.txt"), "nested", "utf8");

  const running = await startDevServer({ cwd, port: 0 });
  t.after(() => new Promise((resolve) => running.server.close(resolve)));

  const html = await request(`${running.url}/`);
  assert.equal(html.status, 200);
  assert.match(html.type, /text\/html/);
  assert.match(html.body, /Served/);

  const css = await request(`${running.url}/styles.css`);
  assert.equal(css.status, 200);
  assert.match(css.type, /text\/css/);

  const js = await request(`${running.url}/app.js`);
  assert.equal(js.status, 200);
  assert.match(js.type, /javascript/);

  const nested = await request(`${running.url}/assets/note.txt`);
  assert.equal(nested.status, 200);
  assert.equal(nested.body, "nested");

  const missing = await request(`${running.url}/missing.txt`);
  assert.equal(missing.status, 404);
});

test("dev CLI accepts a custom port and reports the server address", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("cli-dev", { cwd: parent });
  const out = [];
  const errors = [];
  let received;

  const code = await run(["dev", "--port", "4100"], {
    out: (message) => out.push(message),
    error: (message) => errors.push(message)
  }, {
    cwd,
    startDevServer: async (options) => {
      received = options;
      return {
        url: "http://127.0.0.1:4100",
        project: { entryRelative: path.join("src", "index.html") }
      };
    }
  });

  assert.equal(code, 0);
  assert.equal(received.port, 4100);
  assert.match(out.join("\n"), /127\.0\.0\.1:4100/);
  assert.deepEqual(errors, []);
});

test("dev fails cleanly when the configured entry is missing", async (t) => {
  const parent = await temp(t);
  const cwd = await createProject("missing-entry", { cwd: parent });
  await fs.rm(path.join(cwd, "src", "index.html"));
  await assert.rejects(startDevServer({ cwd, port: 0 }), /Configured entry does not exist/);
});
