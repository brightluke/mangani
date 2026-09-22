# MANGANI

> **Build here. Build with less.**

MANGANI is a lightweight, offline-first project builder from BMK24. It creates, serves and builds small web projects without requiring a framework, runtime dependencies in generated projects, or an internet connection.

The name comes from the Nyanja root *kumanga* — to build.

## Status

MANGANI v0.2 provides three core operations:

- `mangani create <project-name>` creates a dependency-free web starter.
- `mangani dev` serves the current project locally with Node.js built-ins.
- `mangani build` creates safe static production output.

MANGANI also rejects unsafe project paths, refuses to overwrite unowned build output, and keeps the generated project itself free of runtime dependencies.

## Requirements

- Node.js 20 or newer
- npm for package installation or local development

Generated projects require no package install and no network connection.

## Development setup

```sh
git clone https://github.com/brightluke/mangani.git
cd mangani
npm test
npm link
```

## Create a project

```sh
mangani create my-project
cd my-project
```

A generated project contains:

```text
my-project/
├── README.md
├── mangani.config.json
└── src/
    ├── app.js
    ├── index.html
    └── styles.css
```

The project configuration is intentionally small:

```json
{
  "name": "my-project",
  "entry": "src/index.html",
  "output": "dist"
}
```

## Run locally

```sh
mangani dev
```

The default development address is:

```text
http://127.0.0.1:3000
```

Choose another port when needed:

```sh
mangani dev --port 4000
```

MANGANI serves the directory containing the configured entry file. There is no hot reload in v0.2; edit files and refresh the browser.

## Build

```sh
mangani build
```

For the default project this copies the static source tree into:

```text
dist/
```

v0.2 does not bundle, transpile or minify. The build operation prepares the dependency-free static project for deployment as-is.

MANGANI writes `.mangani-build.json` into output it owns. A later build may replace an output directory carrying a valid MANGANI marker for the same project. If the configured output already exists without that marker, MANGANI refuses to overwrite it.

## CLI

```text
mangani create <project-name>
mangani dev [--port <port>]
mangani build
mangani --help
mangani --version
```

## Principles

1. **Build with less.** The starter has no external packages or CDN assets.
2. **Readable by beginners.** Generated code should explain itself through its structure.
3. **Safe by default.** MANGANI rejects path traversal and does not overwrite unowned work.
4. **Claims follow proof.** A feature is documented as available only after it exists and is tested.
5. **Useful on ordinary hardware.** The tool is designed for students, small teams and constrained environments.

## v0.2 boundary

Version 0.2 proves that a MANGANI project can be created, run locally and turned into static production output.

Not included in v0.2:

- hot reload
- bundling or minification
- TypeScript or JSX transforms
- component/page generators
- additional templates
- deployment automation
- plugin systems

## Verification

The repository test suite covers project creation, configuration safety, static serving, custom ports, 404 behavior, static builds, nested assets, rebuild ownership and overwrite protection.

GitHub Actions runs syntax checks and the test suite on Node.js 20 and Node.js 24 for pushes and pull requests targeting `main`.

## Roadmap

Future work may include:

- hot reload
- additional project templates
- KIT00 and ESP32 dashboard template
- component and page generators
- deployment workflows

Roadmap items are intentions, not current features.

## Project history

MANGANI began as ZeeJS. The final pre-rebuild state is preserved in Git as `zeejs-v1.0.0`. MANGANI v0.1 established the safe project creator; v0.2 adds development serving and production output.

## License

MIT © 2026 Bright Musanya / BMK24
