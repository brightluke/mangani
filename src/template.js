"use strict";

function titleFromName(name) {
  return name
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createTemplate(name) {
  const title = titleFromName(name);

  return {
    "README.md": `# ${title}

Created with MANGANI.

Run \`mangani dev\` to serve the project locally.
Run \`mangani build\` to create production output in \`dist/\`.
`,
    "mangani.config.json": `${JSON.stringify(
      {
        name,
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
  <meta name="description" content="${title}, built with MANGANI">
  <title>${title}</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <main class="shell">
    <p class="mark">MANGANI</p>
    <h1>${title}</h1>
    <p>Build here. Build with less.</p>
    <button id="counter" type="button">Built 0 times</button>
  </main>
  <script src="./app.js"></script>
</body>
</html>
`,
    "src/styles.css": `:root {
  color-scheme: light dark;
  font-family: system-ui, sans-serif;
  background: #111a14;
  color: #f1f5f2;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.shell {
  width: min(42rem, calc(100% - 2rem));
  margin: 15vh auto;
}

.mark {
  color: #b8d44a;
  font-weight: 800;
  letter-spacing: 0.16em;
}

h1 {
  font-size: clamp(2.5rem, 8vw, 5rem);
  margin: 0.25rem 0;
}

button {
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: #b8d44a;
  color: #111a14;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
`,
    "src/app.js": `"use strict";

const counter = document.querySelector("#counter");
let builds = 0;

counter.addEventListener("click", () => {
  builds += 1;
  counter.textContent = \`Built \${builds} \${builds === 1 ? "time" : "times"}\`;
});
`
  };
}

module.exports = {
  createTemplate,
  titleFromName
};
