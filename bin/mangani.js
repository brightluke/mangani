#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Import project structure
const projectStructure = require("./struct");

// Function to create files/folders
function createFiles(basePath, structure) {
  Object.entries(structure).forEach(([key, value]) => {
    const fullPath = path.join(basePath, key);
    if (typeof value === "string") {
      try {
        fs.writeFileSync(fullPath, value);
        console.log(`✅ Created file: ${fullPath}`);
      } catch (err) {
        console.error(`❌ Error creating file: ${fullPath}`, err.message);
      }
    } else {
      fs.mkdirSync(fullPath, { recursive: true });
      createFiles(fullPath, value);
    }
  });
}

// Function to detect package manager
function detectPackageManager() {
  if (fs.existsSync("yarn.lock")) return "yarn";
  if (fs.existsSync("pnpm-lock.yaml")) return "pnpm";
  return "npm";
}

// CLI command handling
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

switch (command) {
  case "create":
    if (!param) {
      console.error("❌ Error: Please provide a project name.");
      console.log("Usage: zee create <project-name>");
      process.exit(1);
    }

    const projectPath = path.join(process.cwd(), param);

    if (fs.existsSync(projectPath)) {
      console.error("❌ Error: Project already exists!");
      process.exit(1);
    }

    fs.mkdirSync(projectPath, { recursive: true });
    createFiles(projectPath, projectStructure);

    console.log(`\n🎉 Project "${param}" created successfully!`);
    console.log(`📂 Navigate: cd ${param}`);
    console.log(`🚀 Start the project: open src/index.html (Mac/Linux) OR start src/index.html (Windows)`);
    break;

  case "install":
    if (!param) {
      console.error("❌ Error: Please provide a package name.");
      console.log("Usage: zee install <package-name>");
      process.exit(1);
    }

    const packageManager = detectPackageManager();
    console.log(`📦 Installing ${param} using ${packageManager}...`);

    try {
      execSync(`${packageManager} install ${param}`, { stdio: "inherit" });
      console.log(`✅ Package ${param} installed successfully!`);
    } catch (error) {
      console.error(`❌ Failed to install ${param}:`, error.message);
    }
    break;

  default:
    console.log("📌 Usage:\n  zee create <project-name>\n  zee install <package-name>");
}
