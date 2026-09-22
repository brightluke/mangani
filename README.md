# MANGANI

> **Build here. Build with less.**

MANGANI is a lightweight, offline-first project builder from BMK24. It creates, serves, watches, grows and builds small web projects without requiring a framework or runtime dependencies in generated projects.

The name comes from the Nyanja root *kumanga* — to build.

## Status

MANGANI v0.5 adds deliberate project templates through one stable core.

Available templates:

```text
basic
dashboard
```

The default remains `basic`.

## Create a basic project

These commands are equivalent:

```sh
mangani create my-site
mangani create my-site --template basic
```

The basic template remains the small dependency-free starter used by earlier MANGANI releases.

## Create a dashboard project

```sh
mangani create ops-panel --template dashboard
```

The dashboard starter includes:

```text
ops-panel/
├── README.md
├── mangani.config.json
└── src/
    ├── app.js
    ├── index.html
    ├── styles.css
    └── components/
        └── status-card/
            └── status-card.js
```

It is plain HTML, CSS and JavaScript with no runtime dependencies and no network requirement.

## Template registry

Template names are resolved through MANGANI's internal registry. They are not treated as filesystem paths.

Unknown templates fail cleanly:

```text
MANGANI: Unknown template "react". Available templates: basic, dashboard
```

v0.5 does not support remote templates, custom template directories or third-party template loading.

## Project configuration

New projects record the selected template:

```json
{
  "name": "ops-panel",
  "template": "dashboard",
  "entry": "src/index.html",
  "output": "dist"
}
```

Existing projects created before v0.5 do not need migration. A configuration without `template` remains valid for development, generation and builds.

## Develop

```sh
mangani dev
```

Custom port:

```sh
mangani dev --port 4000
```

Both built-in templates work with the same development server and live reload system.

## Generate

```sh
mangani generate page about
mangani generate component navbar
```

Generation remains independent of the selected starter template.

## Build

```sh
mangani build
```

Both templates use the same safe static build system and ownership marker.

## CLI

```text
mangani create <project-name> [--template <template>]
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

## v0.5 boundary

Included:

- template registry
- `basic` template
- `dashboard` template
- `--template` support on `mangani create`
- template identity in new project configuration
- backward compatibility with older configs
- dev/build compatibility for both templates
- tests and CI

Not included:

- third-party templates
- remote template downloads
- custom template directories
- template marketplace
- KIT00 / ESP32 template
- React, Vue, Svelte or similar framework starters
- TypeScript or JSX transforms
- deployment automation
- plugin systems

## Project history

MANGANI began as ZeeJS. The final pre-rebuild state is preserved in Git as `zeejs-v1.0.0`.

- v0.1 established safe project creation.
- v0.2 added development serving and production output.
- v0.3 added the continuous developer loop.
- v0.4 added safe page and component generation.
- v0.5 adds deliberate project templates.

## License

MIT © 2026 Bright Musanya / BMK24
