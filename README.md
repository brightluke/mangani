# MANGANI

> **Build here. Build with less.**

MANGANI is a lightweight, offline-first project builder from BMK24. It creates a small web project that can be opened, read and changed without downloading a framework or depending on an internet connection.

The name comes from the Nyanja root *kumanga* — to build.

## Status

MANGANI is being rebuilt as version 0.1. The current implemented surface is intentionally small and honest:

- Create a dependency-free web starter.
- Show CLI help.
- Show the installed version.
- Reject unsafe project paths.
- Refuse to overwrite existing work.

Commands such as `mangani dev` and `mangani build` are planned; they are not implemented yet.

## Requirements

- Node.js 20 or newer
- npm for installation or local development

Generated projects have no runtime dependencies and require no network connection.

## Development setup

```sh
git clone https://github.com/brightluke/mangani.git
cd mangani
git switch rebuild/v0.1
npm test
npm link
```

## Usage

```sh
mangani create my-project
cd my-project
```

Then open `src/index.html` in a browser.

Other available commands:

```sh
mangani --help
mangani --version
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

## Principles

1. **Build with less.** The first template has no external packages or CDN assets.
2. **Readable by beginners.** Generated code should explain itself through its structure.
3. **Safe by default.** MANGANI rejects path traversal and never overwrites an existing project.
4. **Claims follow proof.** A feature is documented as available only after it exists and is tested.
5. **Useful on ordinary hardware.** The tool is designed for students, small teams and constrained environments.

## v0.1 boundary

Version 0.1 is a reliable project creator, not a complete web framework. Its job is to turn one command into a clean working starting point.

## Roadmap

- `mangani dev`: local development server
- `mangani build`: production output
- Additional project templates
- KIT00 and ESP32 dashboard template
- Component and page generators

Roadmap items are intentions, not current features.

## Project history

MANGANI began as ZeeJS. The final pre-rebuild state is preserved in Git as `zeejs-v1.0.0`. Development continues under the MANGANI name from version 0.1.

## License

MIT © 2026 Bright Musanya / BMK24
