"use strict";

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { buildProject } = require("../src/build-project");
const { createProject } = require("../src/create-project");
const { startDevServer } = require("../src/dev-server");
const {
  createLiveReload,
  injectLiveReload,
  RELOAD_ENDPOINT
} = require("../src/live-reload");

async function temp(t) {
  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), "mangani-reload-")
  );

  t.after(() =>
    fs.rm(dir, { recursive: true, force: true })
  );

  return dir;
}

function fakeResponse() {
  const response = new EventEmitter();

  response.headers = null;
  response.writes = [];
  response.ended = false;

  response.writeHead = (status, headers) => {
    response.status = status;
    response.headers = headers;
  };

  response.write = (chunk) => {
    response.writes.push(String(chunk));
    return true;
  };

  response.end = () => {
    response.ended = true;
    response.emit("close");
  };

  return response;
}

function fakeWatcher() {
  const watcher = new EventEmitter();

  watcher.close = () => {
    watcher.closed = true;
  };

  return watcher;
}

test(
  "injects the live reload runtime without requiring a body tag",
  () => {
    assert.match(
      injectLiveReload("<body>ok</body>"),
      /data-mangani-live-reload/
    );

    assert.match(
      injectLiveReload("<h1>ok<\/h1>"),
      /data-mangani-live-reload/
    );

    assert.equal(
      RELOAD_ENDPOINT,
      "/__mangani/events"
    );
  }
);

test(
  "SSE clients connect, receive reloads and disconnect cleanly",
  () => {
    const watcher = fakeWatcher();

    const live = createLiveReload(
      "/tmp/source",
      {
        watchFactory: () => watcher
      }
    );

    const first = fakeResponse();
    const second = fakeResponse();

    live.connect(first);
    live.connect(second);

    assert.equal(live.clientCount(), 2);

    live.broadcast("styles.css");

    assert.match(
      first.writes.join(""),
      /event: reload/
    );

    assert.match(
      second.writes.join(""),
      /styles\.css/
    );

    first.emit("close");
    assert.equal(live.clientCount(), 1);

    live.close();

    assert.equal(watcher.closed, true);
    assert.equal(live.clientCount(), 0);
  }
);

test(
  "rapid watch events are debounced to one reload",
  async () => {
    const watcher = fakeWatcher();
    let callback;

    const live = createLiveReload(
      "/tmp/source",
      {
        debounceMs: 20,
        watchFactory: (_path, _options, cb) => {
          callback = cb;
          return watcher;
        }
      }
    );

    const client = fakeResponse();
    live.connect(client);

    callback("change", "a.css");
    callback("change", "b.css");
    callback("change", "c.css");

    await new Promise((resolve) =>
      setTimeout(resolve, 50)
    );

    const events = client.writes.filter(
      (write) => write.includes("event: reload")
    );

    assert.equal(events.length, 1);
    assert.match(events[0], /c\.css/);

    live.close();
  }
);

test(
  "real source changes emit reload events through SSE",
  async (t) => {
    const parent = await temp(t);
    const cwd = await createProject(
      "watch-real",
      { cwd: parent }
    );

    const running = await startDevServer({
      cwd,
      port: 0,
      debounceMs: 30
    });

    t.after(() => running.close());

    const event = await new Promise(
      (resolve, reject) => {
        const req = http.get(
          `${running.url}${RELOAD_ENDPOINT}`,
          (response) => {
            let data = "";

            const timer = setTimeout(() => {
              req.destroy();
              reject(
                new Error("reload event timeout")
              );
            }, 3000);

            response.on(
              "data",
              async (chunk) => {
                data += chunk.toString();

                if (
                  data.includes(": connected")
                ) {
                  await fs.writeFile(
                    path.join(
                      cwd,
                      "src",
                      "styles.css"
                    ),
                    "body { color: black; }\n",
                    "utf8"
                  );
                }

                if (
                  data.includes("event: reload")
                ) {
                  clearTimeout(timer);
                  req.destroy();
                  resolve(data);
                }
              }
            );
          }
        );

        req.on("error", (error) => {
          if (error.code !== "ECONNRESET") {
            reject(error);
          }
        });
      }
    );

    assert.match(event, /event: reload/);
    assert.match(event, /styles\.css/);
  }
);

test(
  "nested directory changes emit reload events",
  async () => {
    const watcher = fakeWatcher();
    let callback;

    const live = createLiveReload(
      "/tmp/source",
      {
        debounceMs: 10,
        watchFactory: (_path, _options, cb) => {
          callback = cb;
          return watcher;
        }
      }
    );

    const client = fakeResponse();
    live.connect(client);

    callback(
      "change",
      path.join("assets", "icon.svg")
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 30)
    );

    assert.match(
      client.writes.join(""),
      /assets\/icon\.svg/
    );

    live.close();
  }
);

test(
  "production builds never contain the development reload runtime",
  async (t) => {
    const parent = await temp(t);
    const cwd = await createProject(
      "clean-build",
      { cwd: parent }
    );

    await buildProject({ cwd });

    const html = await fs.readFile(
      path.join(cwd, "dist", "index.html"),
      "utf8"
    );

    assert.doesNotMatch(
      html,
      /data-mangani-live-reload|__mangani\/events/
    );
  }
);

test(
  "closing the development runtime closes watcher resources",
  async (t) => {
    const parent = await temp(t);
    const cwd = await createProject(
      "close-clean",
      { cwd: parent }
    );

    let watcher;

    const running = await startDevServer({
      cwd,
      port: 0,
      watchFactory: (
        _path,
        _options,
        _callback
      ) => {
        watcher = fakeWatcher();
        return watcher;
      }
    });

    await running.close();

    assert.equal(watcher.closed, true);
    assert.equal(running.server.listening, false);
  }
);
