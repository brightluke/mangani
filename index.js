"use strict";

const { buildProject } = require("./src/build-project");
const { run } = require("./src/cli");
const {
  createProject,
  validateProjectName
} = require("./src/create-project");
const { startDevServer } = require("./src/dev-server");
const {
  createLiveReload,
  injectLiveReload
} = require("./src/live-reload");
const { loadProject } = require("./src/project");

module.exports = {
  buildProject,
  createLiveReload,
  createProject,
  injectLiveReload,
  loadProject,
  run,
  startDevServer,
  validateProjectName
};
