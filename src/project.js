"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const CONFIG_FILE = "mangani.config.json";

function isInside(parent, target) {
  const relative = path.relative(parent, target);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function resolveProjectPath(projectRoot, value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Configuration field "${field}" must be a non-empty relative path.`);
  }

  if (path.isAbsolute(value)) {
    throw new Error(`Configuration field "${field}" must stay inside the project.`);
  }

  const resolved = path.resolve(projectRoot, value);
  if (!isInside(projectRoot, resolved)) {
    throw new Error(`Configuration field "${field}" must stay inside the project.`);
  }

  return resolved;
}

async function loadProject(options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  const configPath = path.join(root, CONFIG_FILE);

  let raw;
  try {
    raw = await fs.readFile(configPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`No ${CONFIG_FILE} found. Run this command from a MANGANI project root.`);
    }
    throw error;
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch {
    throw new Error(`${CONFIG_FILE} contains invalid JSON.`);
  }

  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(`${CONFIG_FILE} must contain a JSON object.`);
  }

  if (typeof config.name !== "string" || config.name.trim() === "") {
    throw new Error('Configuration field "name" must be a non-empty string.');
  }

  const entryPath = resolveProjectPath(root, config.entry, "entry");
  const outputPath = resolveProjectPath(root, config.output, "output");
  const sourcePath = path.dirname(entryPath);

  // BMK24 SAFETY: output must never overlap the source tree we are about to copy.
  if (outputPath === sourcePath || isInside(sourcePath, outputPath)) {
    throw new Error('Configuration field "output" must not be inside the source directory.');
  }

  return {
    root,
    configPath,
    config,
    entryPath,
    sourcePath,
    outputPath,
    entryRelative: path.relative(root, entryPath),
    outputRelative: path.relative(root, outputPath)
  };
}

module.exports = {
  CONFIG_FILE,
  isInside,
  loadProject,
  resolveProjectPath
};
