"use strict";

const { buildProject } = require("./src/build-project");
const { run } = require("./src/cli");
const {
  createProject,
  validateProjectName
} = require("./src/create-project");
const { startDevServer } = require("./src/dev-server");
const {
  generate,
  validateGeneratorName,
  validateGeneratorType
} = require("./src/generate");
const {
  createLiveReload,
  injectLiveReload
} = require("./src/live-reload");
const { loadProject } = require("./src/project");

module.exports = {
  buildProject,
  createLiveReload,
  createProject,
  generate,
  injectLiveReload,
  loadProject,
  run,
  startDevServer,
  validateGeneratorName,
  validateGeneratorType,
  validateProjectName
};
