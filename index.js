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
const {
  DEFAULT_TEMPLATE,
  createTemplate,
  getTemplate,
  hasTemplate,
  listTemplates
} = require("./src/templates");

module.exports = {
  DEFAULT_TEMPLATE,
  buildProject,
  createLiveReload,
  createProject,
  createTemplate,
  generate,
  getTemplate,
  hasTemplate,
  injectLiveReload,
  listTemplates,
  loadProject,
  run,
  startDevServer,
  validateGeneratorName,
  validateGeneratorType,
  validateProjectName
};
