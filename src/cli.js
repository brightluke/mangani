"use strict";

const packageInfo = require("../package.json");
const { buildProject } = require("./build-project");
const { createProject } = require("./create-project");
const {
  DEFAULT_PORT,
  parsePort,
  startDevServer
} = require("./dev-server");
const { generate } = require("./generate");

const HELP = `MANGANI ${packageInfo.version}
Build here. Build with less.

Usage:
  mangani create <project-name>
  mangani dev [--port <port>]
  mangani build
  mangani generate <page|component> <name>
  mangani --help
  mangani --version

Commands:
  create     Create a dependency-free starter project
  dev        Serve, watch and live-reload the current project
  build      Create safe static production output
  generate   Add a safe page or component to the current project
`;

function defaultIO() {
  return {
    out: (message) => console.log(message),
    error: (message) => console.error(message)
  };
}

function parseDevArgs(args) {
  if (args.length === 0) return { port: DEFAULT_PORT };

  if (args.length === 2 && args[0] === "--port") {
    return { port: parsePort(args[1]) };
  }

  throw new Error("Usage: mangani dev [--port <port>]");
}

async function run(
  args = process.argv.slice(2),
  io = defaultIO(),
  options = {}
) {
  const [command, ...rest] = args;

  if (
    !command ||
    command === "--help" ||
    command === "-h" ||
    command === "help"
  ) {
    io.out(HELP);
    return 0;
  }

  if (
    command === "--version" ||
    command === "-v" ||
    command === "version"
  ) {
    io.out(packageInfo.version);
    return 0;
  }

  if (command === "create") {
    const [projectName, ...extra] = rest;

    if (!projectName || extra.length > 0) {
      io.error("Usage: mangani create <project-name>");
      return 1;
    }

    try {
      const projectPath = await createProject(projectName, {
        cwd: options.cwd || process.cwd()
      });

      io.out(`Created ${projectName}`);
      io.out(`Location: ${projectPath}`);
      io.out(`Next: cd ${projectName} && mangani dev`);
      return 0;
    } catch (error) {
      io.error(`MANGANI: ${error.message}`);
      return 1;
    }
  }

  if (command === "dev") {
    try {
      const { port } = parseDevArgs(rest);
      const start = options.startDevServer || startDevServer;

      const result = await start({
        cwd: options.cwd || process.cwd(),
        port,
        onReload: options.onReload,
        onWatchError: options.onWatchError
      });

      io.out(`MANGANI ${packageInfo.version}`);
      io.out("Development server running");
      io.out("");
      io.out(`Local:  ${result.url}`);
      io.out(`Entry:  ${result.project.entryRelative}`);
      io.out(`Watch:  ${result.watch || "src"}`);
      io.out("Reload: enabled");
      io.out("");
      io.out("Press Ctrl+C to stop.");
      return 0;
    } catch (error) {
      io.error(`MANGANI: ${error.message}`);
      return 1;
    }
  }

  if (command === "build") {
    if (rest.length > 0) {
      io.error("Usage: mangani build");
      return 1;
    }

    try {
      const build = options.buildProject || buildProject;
      const result = await build({
        cwd: options.cwd || process.cwd()
      });

      io.out(`MANGANI ${packageInfo.version}`);
      io.out("");
      io.out(`Built ${result.project}`);
      io.out("");
      io.out(`Entry:  ${result.entry}`);
      io.out(
        `Output: ${result.output}${result.output.endsWith("/") ? "" : "/"}`
      );
      io.out("");
      io.out("Build complete.");
      return 0;
    } catch (error) {
      io.error(`MANGANI: ${error.message}`);
      return 1;
    }
  }

  if (command === "generate") {
    const [type, name, ...extra] = rest;

    if (!type || !name || extra.length > 0) {
      io.error(
        "Usage: mangani generate <page|component> <name>"
      );
      return 1;
    }

    try {
      const generateItem = options.generate || generate;
      const result = await generateItem(type, name, {
        cwd: options.cwd || process.cwd()
      });

      io.out(
        `Generated ${result.type} ${result.name}`
      );
      io.out(`Location: ${result.relativePath}`);
      return 0;
    } catch (error) {
      io.error(`MANGANI: ${error.message}`);
      return 1;
    }
  }

  io.error(`Unknown command: ${command}`);
  io.error("Run 'mangani --help' for usage.");
  return 1;
}

module.exports = {
  HELP,
  parseDevArgs,
  run
};
