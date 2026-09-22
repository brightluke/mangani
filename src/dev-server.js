"use strict";

const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { isInside, loadProject } = require("./project");

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3000;

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"]
]);

function parsePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Port must be an integer between 1 and 65535.");
  }
  return port;
}

function contentType(filePath) {
  return MIME_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function createRequestHandler(project) {
  const entryName = path.basename(project.entryPath);

  return async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://mangani.local");
      let pathname;

      try {
        pathname = decodeURIComponent(requestUrl.pathname);
      } catch {
        response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
        response.end("Bad Request\n");
        return;
      }

      const relative = pathname === "/" ? entryName : pathname.replace(/^\/+/, "");
      const target = path.resolve(project.sourcePath, relative);

      // BMK24 SAFETY: URL traversal never escapes the source directory.
      if (target !== project.sourcePath && !isInside(project.sourcePath, target)) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not Found\n");
        return;
      }

      if (!(await fileExists(target))) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not Found\n");
        return;
      }

      const body = await fs.readFile(target);
      response.writeHead(200, {
        "content-type": contentType(target),
        "content-length": body.length,
        "cache-control": "no-store"
      });
      response.end(body);
    } catch {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end("MANGANI development server error.\n");
    }
  };
}

async function startDevServer(options = {}) {
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

  const host = options.host || DEFAULT_HOST;
  const port = options.port === 0 ? 0 : parsePort(options.port ?? DEFAULT_PORT);
  const server = http.createServer(createRequestHandler(project));

  await new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });

  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;

  return {
    server,
    host,
    port: actualPort,
    url: `http://${host}:${actualPort}`,
    project
  };
}

module.exports = {
  DEFAULT_HOST,
  DEFAULT_PORT,
  createRequestHandler,
  parsePort,
  startDevServer
};
