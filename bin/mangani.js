#!/usr/bin/env node

"use strict";

const { run } = require("../src/cli");

run()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error("MANGANI failed:", error.message);
    process.exitCode = 1;
  });
