"use strict";

const { createBasicTemplate } = require("./basic");
const { createDashboardTemplate } = require("./dashboard");

const DEFAULT_TEMPLATE = "basic";

const TEMPLATE_REGISTRY = new Map([
  ["basic", createBasicTemplate],
  ["dashboard", createDashboardTemplate]
]);

function listTemplates() {
  return [...TEMPLATE_REGISTRY.keys()];
}

function hasTemplate(name) {
  return TEMPLATE_REGISTRY.has(name);
}

function getTemplate(name = DEFAULT_TEMPLATE) {
  if (!hasTemplate(name)) {
    throw new Error(
      `Unknown template "${name}". Available templates: ${listTemplates().join(", ")}`
    );
  }

  return TEMPLATE_REGISTRY.get(name);
}

function createTemplate(name, templateName = DEFAULT_TEMPLATE) {
  return getTemplate(templateName)(name);
}

module.exports = {
  DEFAULT_TEMPLATE,
  TEMPLATE_REGISTRY,
  createTemplate,
  getTemplate,
  hasTemplate,
  listTemplates
};
