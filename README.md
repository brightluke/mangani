# MANGANI

> **Build here. Build with less.**

MANGANI is a lightweight, offline-first project builder from BMK24. It creates, serves, watches and builds small web projects without requiring a framework or runtime dependencies in generated projects.

The name comes from the Nyanja root *kumanga* — to build.

## Status

MANGANI v0.3 adds the developer loop:

- `mangani create <project-name>` creates a dependency-free web starter.
- `mangani dev` serves the current project, watches its source files and reloads connected browsers after changes.
- `mangani dev --port <port>` runs the same development loop on a custom port.
- `mangani build` creates safe static production output.

Live reload is implemented with Node.js built-ins and Server-Sent Events. The development runtime is injected only into served HTML responses; MANGANI does not modify source HTML and does not include the reload runtime in production builds.

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

The project configuration remains intentionally small:

```json
{
  "name": "my-project",
  "entry": "src/index.html",
  "output": "dist"
}
```

v0.3 requires no configuration migration from v0.2.

## Develop with live reload

```sh
mangani dev
```

Default development address:

```text
http://127.0.0.1:3000
```

Choose another port:

```sh
mangani dev --port 4000
```

The terminal reports the active source watch:

```text
MANGANI 0.3.0
Development server running

Local:  http://127.0.0.1:3000
Entry:  src/index.html
Watch:  src
Reload: enabled

Press Ctrl+C to stop.
```

When a source file changes, MANGANI debounces filesystem events and broadcasts one reload event to connected browsers.

The internal development endpoint is:

```text
/__mangani/events
```

It uses Server-Sent Events. The `/__mangani/*` namespace is reserved for MANGANI development services.

## Build

```sh
mangani build
```

For the default project this copies the static source tree into:

```text
dist/
```

v0.3 still does not bundle, transpile or minify. The development reload script is not written to source files and is not present in build output.

MANGANI writes `.mangani-build.json` into output it owns. A later build may replace output carrying a valid MANGANI marker for the same project. If the configured output already exists without that marker, MANGANI refuses to overwrite it.

## CLI

```text
mangani create <project-name>
mangani dev [--port <port>]
mangani build
mangani --help
mangani --version
```

## Principles

1. **Build with less.** The starter and developer loop use platform capabilities instead of a framework stack.
2. **Readable by beginners.** Generated code should explain itself through its structure.
3. **Safe by default.** MANGANI rejects path traversal and does not overwrite unowned work.
4. **Claims follow proof.** A feature is documented as available only after it exists and is tested.
5. **Useful on ordinary hardware.** The tool is designed for students, small teams and constrained environments.

## v0.3 boundary

Version 0.3 proves that a MANGANI project can support a continuous local developer loop:

```text
edit → save → detect → reload
```

Included:

- recursive source watching
- automatic full-page reload
- Server-Sent Events
- multiple connected browser clients
- filesystem event debouncing
- clean watcher/client shutdown
- development-only HTML runtime injection

Not included:

- hot module replacement
- CSS-only replacement
- JavaScript module replacement
- build-on-save
- TypeScript or JSX transforms
- component/page generators
- additional templates
- deployment automation
- plugin systems

## Verification

The v0.3 suite preserves the v0.2 tests and adds coverage for runtime injection, SSE clients, real filesystem changes, nested changes, debouncing, source preservation, production-build cleanliness and watcher cleanup.

GitHub Actions runs syntax checks and the test suite on Node.js 20 and Node.js 24 for pull requests targeting `main`.

## Project history

MANGANI began as ZeeJS. The final pre-rebuild state is preserved in Git as `zeejs-v1.0.0`.

- v0.1 established safe project creation.
- v0.2 added development serving and production output.
- v0.3 adds the continuous developer loop.

## License

MIT © 2026 Bright Musanya / BMK24
