"use strict";

function titleFromName(name) {
  return name
    .split(/[._-]+/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ");
}

function createTemplate(name, templateName = "basic") {
  // BMK24 COMPATIBILITY: preserve the historical helper while routing
  // all template selection through the v0.5 registry.
  const templates = require("./templates");
  return templates.createTemplate(name, templateName);
}

module.exports = {
  createTemplate,
  titleFromName
};
