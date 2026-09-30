"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { createRequire } = require("node:module");

const root = path.resolve(__dirname, "..");
const metadata = require("../package.json");

async function verify() {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "mangani-package-"));
  const npm = (args, cwd = root) => execFileSync("npm", args, {
    cwd, encoding: "utf8", timeout: 60000
  });
  try {
    const [packed] = JSON.parse(npm([
      "pack", "--ignore-scripts", "--json", "--pack-destination", temp
    ]));
    const included = new Set(packed.files.map((file) => file.path));
    for (const file of ["index.js", "package.json", "bin/mangani.js",
      "README.md", "LICENSE", "src/templates/index.js",
      "src/templates/basic.js", "src/templates/dashboard.js"]) {
      assert.ok(included.has(file), `Package missing ${file}`);
    }
    for (const file of included) {
      assert.ok(!/^(test|scripts|docs|\.github)\//.test(file), `Unexpected package file ${file}`);
    }
    const install = path.join(temp, "install");
    await fs.mkdir(install);
    npm(["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund",
      "--prefix", install, path.join(temp, packed.filename)], temp);
    const installedRequire = createRequire(path.join(install, "package.json"));
    const api = installedRequire(metadata.name);
    assert.deepEqual(api.listTemplates(), ["basic", "dashboard"]);
    const cli = path.join(install, "node_modules", ".bin", "mangani");
    const run = (args, cwd = temp) => execFileSync(cli, args, {
      cwd, encoding: "utf8", timeout: 15000
    });
    assert.equal(run(["--version"]).trim(), metadata.version);
    assert.match(run(["--help"]), /--template/);
    for (const template of api.listTemplates()) {
      run(["create", template, "--template", template]);
      const cwd = path.join(temp, template);
      run(["generate", "page", "about"], cwd);
      run(["generate", "component", "navbar"], cwd);
      const server = await api.startDevServer({ cwd, port: 0 });
      try {
        const response = await fetch(server.url, { signal: AbortSignal.timeout(5000) });
        assert.equal(response.status, 200);
        assert.match(await response.text(), /<html/i);
      } finally {
        await server.close();
      }
      run(["build"], cwd);
      assert.ok((await fs.stat(path.join(cwd, "dist", "index.html"))).isFile());
      console.log(`Packed ${template}: create, generate, serve, build PASS`);
    }
    assert.throws(() => run(["create", "invalid", "--template", "unknown"]));
    console.log(`Packed ${metadata.name}@${metadata.version}: ${included.size} files; offline install, CLI and API PASS`);
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
}

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
