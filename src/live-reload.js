"use strict";

const fs = require("node:fs");
const path = require("node:path");

const RELOAD_ENDPOINT = "/__mangani/events";
const DEFAULT_DEBOUNCE_MS = 100;

const DEV_RUNTIME = `<script data-mangani-live-reload>
(() => {
  const events = new EventSource("${RELOAD_ENDPOINT}");
  events.addEventListener("reload", () => window.location.reload());
})();
</script>`;

function injectLiveReload(html) {
  const closingBody = /<\\/body\\s*>/i;
  if (closingBody.test(html)) {
    return html.replace(closingBody, `${DEV_RUNTIME}\n</body>`);
  }
  return `${html}\n${DEV_RUNTIME}\n`;
}

function normalizeChangedPath(sourcePath, filename) {
  if (!filename) return ".";
  return path
    .relative(sourcePath, path.resolve(sourcePath, String(filename)))
    .split(path.sep)
    .join("/");
}

function createLiveReload(sourcePath, options = {}) {
  const clients = new Set();
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const watchFactory = options.watchFactory || fs.watch;
  let timer = null;
  let pendingPath = ".";
  let closed = false;

  function broadcast(changedPath = ".") {
    if (closed) return;

    const message =
      `event: reload\ndata: ${JSON.stringify({ path: changedPath })}\n\n`;

    for (const response of [...clients]) {
      try {
        response.write(message);
      } catch {
        clients.delete(response);
      }
    }
  }

  function schedule(filename) {
    if (closed) return;

    pendingPath = normalizeChangedPath(sourcePath, filename);
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      const changedPath = pendingPath;
      pendingPath = ".";
      broadcast(changedPath);

      if (typeof options.onReload === "function") {
        options.onReload(changedPath);
      }
    }, debounceMs);
  }

  const watcher = watchFactory(
    sourcePath,
    { recursive: true },
    (_eventType, filename) => schedule(filename)
  );

  if (watcher && typeof watcher.on === "function") {
    watcher.on("error", (error) => {
      if (typeof options.onError === "function") {
        options.onError(error);
      }
    });
  }

  function connect(response) {
    response.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive"
    });
    response.write(": connected\n\n");
    clients.add(response);

    const remove = () => clients.delete(response);
    response.once("close", remove);
    response.once("error", remove);
  }

  function close() {
    if (closed) return;
    closed = true;

    if (timer) clearTimeout(timer);
    timer = null;

    if (watcher && typeof watcher.close === "function") {
      watcher.close();
    }

    for (const response of clients) {
      response.end();
    }
    clients.clear();
  }

  return {
    broadcast,
    clientCount: () => clients.size,
    close,
    connect,
    endpoint: RELOAD_ENDPOINT,
    schedule
  };
}

module.exports = {
  DEFAULT_DEBOUNCE_MS,
  DEV_RUNTIME,
  RELOAD_ENDPOINT,
  createLiveReload,
  injectLiveReload,
  normalizeChangedPath
};
