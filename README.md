# MANGANI

> **Build here. Build with less.**

MANGANI is a lightweight, offline-first project builder from BMK24. It creates, serves, watches, grows and builds small web projects without requiring a framework or runtime dependencies in generated projects.

The name comes from the Nyanja root *kumanga* — to build.

## Status

MANGANI v0.4 adds safe structure generation:

- `mangani create <project-name>` creates a dependency-free web starter.
- `mangani dev` serves the project, watches source files and live-reloads connected browsers.
- `mangani build` creates safe static production output.
- `mangani generate page <name>` adds a page structure under `src/pages/`.
- `mangani generate component <name>` adds a component structure under `src/components/`.

Generated structures never overwrite an existing target.

## Requirements

- Node.js 20 or newer
- npm for package installation or local development

Generated projects require no package install and no network connection.

## Create a project

```sh
mangani create my-project
cd my-project
```

## Develop

```sh
mangani dev
```

Default development address:

```text
http://127.0.0.1:3000
```

Custom port:

```sh
mangani dev --port 4000
```

MANGANI watches the configured source tree and reloads connected browsers through its development-only Server-Sent Events channel.

## Generate a page

```sh
mangani generate page about
```

Creates:

```text
src/pages/about/
├── app.js
├── index.html
└── styles.css
```

The page is intentionally standalone. v0.4 does not add routing or modify the application's main entry automatically.

## Generate a component

```sh
mangani generate component navbar
```

Creates:

```text
src/components/navbar/
├── navbar.css
├── navbar.html
└── navbar.js
```

MANGANI creates the component files but does not automatically import or mount the component. The developer remains in control of integration.

## Generator safety

Generator names may contain:

```text
letters
numbers
hyphens
underscores
```

They must begin with a letter or number.

Examples:

```text
about
user_profile
top-nav
card2
```

Unsafe names and nested paths are rejected.

If the target already exists:

```text
target missing
    ↓
CREATE

target exists
    ↓
REFUSE
```

v0.4 has no `--force` option.

## Build

```sh
mangani build
```

MANGANI copies the configured source tree into the configured production output. The development reload runtime is not included in builds.

## CLI

```text
mangani create <project-name>
mangani dev [--port <port>]
mangani build
mangani generate <page|component> <name>
mangani --help
mangani --version
```

## Principles

1. **Build with less.** Prefer platform capabilities over unnecessary framework stacks.
2. **Readable by beginners.** Generated code should be easy to inspect and change.
3. **Safe by default.** MANGANI rejects unsafe paths and does not overwrite unowned work.
4. **Claims follow proof.** Features are documented as available only after implementation and tests.
5. **Useful on ordinary hardware.** MANGANI remains suitable for constrained and offline environments.

## v0.4 boundary

Version 0.4 proves that MANGANI can safely grow an existing project.

Included:

- page generation
- component generation
- generator name validation
- source-tree placement
- overwrite protection
- CLI integration
- tests and CI

Not included:

- automatic routing
- automatic imports
- component runtime
- shorthand `mangani g`
- templates
- KIT00 / ESP32 integration
- TypeScript or JSX transforms
- deployment automation
- plugin systems

## Project history

MANGANI began as ZeeJS. The final pre-rebuild state is preserved in Git as `zeejs-v1.0.0`.

- v0.1 established safe project creation.
- v0.2 added development serving and production output.
- v0.3 added the continuous developer loop.
- v0.4 adds safe page and component generation.

## License

MIT © 2026 Bright Musanya / BMK24
