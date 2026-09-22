"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const {
  DEFAULT_TEMPLATE,
  createTemplate,
  getTemplate
} = require("./templates");

const VALID_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function validateProjectName(name) {
  if (typeof name !== "string" || name.length === 0) {
    throw new Error("Project name is required.");
  }

  if (name.length > 64) {
    throw new Error(
      "Project name must contain 64 characters or fewer."
    );
  }

  if (
    !VALID_NAME.test(name) ||
    name === "." ||
    name === ".."
  ) {
    throw new Error(
      "Project name may contain letters, numbers, dots, hyphens and underscores, and must start with a letter or number."
    );
  }

  return name;
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function createProject(name, options = {}) {
  validateProjectName(name);

  const templateName =
    options.template || DEFAULT_TEMPLATE;

  // BMK24 SAFETY: template names are resolved only through the
  // internal registry and are never treated as filesystem paths.
  getTemplate(templateName);

  const cwd = path.resolve(
    options.cwd || process.cwd()
  );
  const projectPath = path.resolve(cwd, name);

  if (path.dirname(projectPath) !== cwd) {
    throw new Error(
      "Project must be created inside the current directory."
    );
  }

  if (await pathExists(projectPath)) {
    throw new Error(
      `A file or directory named "${name}" already exists.`
    );
  }

  await fs.mkdir(projectPath);

  try {
    const template = createTemplate(
      name,
      templateName
    );

    for (const [relativePath, content] of Object.entries(
      template
    )) {
      const destination = path.join(
        projectPath,
        relativePath
      );

      await fs.mkdir(path.dirname(destination), {
        recursive: true
      });

      await fs.writeFile(destination, content, {
        encoding: "utf8",
        flag: "wx"
      });
    }
  } catch (error) {
    await fs.rm(projectPath, {
      recursive: true,
      force: true
    });
    throw error;
  }

  return projectPath;
}

module.exports = {
  createProject,
  validateProjectName
};
