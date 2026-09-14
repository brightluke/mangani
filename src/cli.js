"use strict";

const packageInfo = require("../package.json");
const { createProject } = require("./create-project");

const HELP = `MANGANI ${packageInfo.version}
Build here. Build with less.

Usage:
  mangani create <project-name>
  mangani --help
  mangani --version

Commands:
  create    Create a dependency-free starter project
`;

function defaultIO() {
  return {
    out: (message) => console.log(message),
    error: (message) => console.error(message)
  };
}

async function run(
  args = process.argv.slice(2),
  io = defaultIO(),
  options = {}
) {
  const [command, projectName, ...extra] = args;

  if (!command || command === "--help" || command === "-h" || command === "help") {
    io.out(HELP);
    return 0;
  }

  if (command === "--version" || command === "-v" || command === "version") {
    io.out(packageInfo.version);
    return 0;
  }

  if (command === "create") {
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
      io.out(`Open: ${projectName}/src/index.html`);
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
  run
};
