"use strict";

const { titleFromName } = require("../template");

function createDashboardTemplate(name) {
  const title = titleFromName(name);

  return {
    "README.md": `# ${title}

Created with MANGANI using the dashboard template.

Run \`mangani dev\` to open the dashboard locally.
Run \`mangani build\` to create production output in \`dist/\`.

The starter is plain HTML, CSS and JavaScript with no runtime dependencies.
`,
    "mangani.config.json": `${JSON.stringify(
      {
        name,
        template: "dashboard",
        entry: "src/index.html",
        output: "dist"
      },
      null,
      2
    )}
`,
    "src/index.html": `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${title} dashboard, built with MANGANI">
  <title>${title}</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div class="dashboard-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">MANGANI DASHBOARD</p>
        <h1>${title}</h1>
      </div>
      <p id="clock" class="clock" aria-live="polite"></p>
    </header>

    <aside class="sidebar" aria-label="Dashboard navigation">
      <strong>Workspace</strong>
      <nav>
        <a href="#overview">Overview</a>
        <a href="#systems">Systems</a>
        <a href="#activity">Activity</a>
      </nav>
    </aside>

    <main class="content">
      <section id="overview">
        <h2>Overview</h2>
        <div id="status-grid" class="status-grid"></div>
      </section>

      <section id="systems" class="panel">
        <h2>Systems</h2>
        <p>Replace these starter cards with your own project data.</p>
      </section>

      <section id="activity" class="panel">
        <h2>Activity</h2>
        <p>Build here. Build with less.</p>
      </section>
    </main>
  </div>

  <script type="module" src="./app.js"></script>
</body>
</html>
`,
    "src/styles.css": `:root {
  font-family: system-ui, sans-serif;
  background: #0f1411;
  color: #eef4ef;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.dashboard-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 14rem 1fr;
  grid-template-rows: auto 1fr;
}

.topbar {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #2a342d;
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #b8d44a;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0;
}

.clock {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.sidebar {
  padding: 1.5rem;
  border-right: 1px solid #2a342d;
}

.sidebar nav {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.sidebar a {
  color: inherit;
  text-decoration: none;
}

.content {
  padding: 1.5rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 1rem;
}

.status-card,
.panel {
  padding: 1rem;
  border: 1px solid #2a342d;
  border-radius: 0.75rem;
  background: #151d18;
}

.status-card strong {
  display: block;
  font-size: 1.5rem;
  margin-top: 0.35rem;
}

@media (max-width: 700px) {
  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid #2a342d;
  }
}
`,
    "src/app.js": `"use strict";

import { createStatusCard } from "./components/status-card/status-card.js";

const statuses = [
  { label: "Services", value: "3 online" },
  { label: "Alerts", value: "0 active" },
  { label: "Build", value: "ready" }
];

const grid = document.querySelector("#status-grid");
const clock = document.querySelector("#clock");

for (const status of statuses) {
  grid.append(createStatusCard(status));
}

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString();
}

updateClock();
setInterval(updateClock, 1000);
`,
    "src/components/status-card/status-card.js": `"use strict";

export function createStatusCard({ label, value }) {
  const card = document.createElement("article");
  card.className = "status-card";

  const name = document.createElement("span");
  name.textContent = label;

  const reading = document.createElement("strong");
  reading.textContent = value;

  card.append(name, reading);
  return card;
}
`
  };
}

module.exports = {
  createDashboardTemplate
};
