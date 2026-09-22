"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { loadProject } = require("./project");

const BUILD_MARKER = ".mangani-build.json";

async function pathStatus(target) {
  try {
    return await fs.stat(target);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function assertOwnedOutput(project) {
  const status = await pathStatus(project.outputPath);
  if (!status) return false;

  if (!status.isDirectory()) {
    throw new Error(`Refusing to overwrite existing non-directory output: ${project.outputRelative}`);
  }

  const markerPath = path.join(project.outputPath, BUILD_MARKER);
  let marker;
  try {
    marker = JSON.parse(await fs.readFile(markerPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" || error instanceof SyntaxError) {
      throw new Error(`Refusing to overwrite unowned output directory: ${project.outputRelative}`);
    }
    throw error;
  }

  if (marker.generatedBy !== "MANGANI" || marker.project !== project.config.name) {
    throw new Error(`Refusing to overwrite unowned output directory: ${project.outputRelative}`);
  }

  return true;
}

async function buildProject(options = {}) {
  const project = await loadProject({ cwd: options.cwd });

  try {
    const entryStat = await fs.stat(project.entryPath);
    if (!entryStat.isFile()) {
      throw new Error(`Configured entry does not point to a file: ${project.entryRelative}`);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Configured entry does not exist: ${project.entryRelative}`);
    }
    throw error;
  }

  const ownedExistingOutput = await assertOwnedOutput(project);
  const outputParent = path.dirname(project.outputPath);
  await fs.mkdir(outputParent, { recursive: true });

  // BMK24 CONTINUITY: build into a staging directory first; replace output only after copy succeeds.
  const stagePath = await fs.mkdtemp(path.join(outputParent, ".mangani-stage-"));

  try {
    await fs.cp(project.sourcePath, stagePath, { recursive: true, force: false });
    await fs.writeFile(
      path.join(stagePath, BUILD_MARKER),
      `${JSON.stringify(
        {
          generatedBy: "MANGANI",
          project: project.config.name
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    if (ownedExistingOutput) {
      await fs.rm(project.outputPath, { recursive: true, force: true });
    }

    await fs.rename(stagePath, project.outputPath);
  } catch (error) {
    await fs.rm(stagePath, { recursive: true, force: true });
    throw error;
  }

  return {
    project: project.config.name,
    entry: project.entryRelative,
    output: project.outputRelative,
    outputPath: project.outputPath
  };
}

module.exports = {
  BUILD_MARKER,
  assertOwnedOutput,
  buildProject
};
