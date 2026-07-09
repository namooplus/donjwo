# Yugain Settlement

Yugain Settlement is a PWA application scaffolded with React, TypeScript, Vite,
Bun, Biome, and Knip. The starter screen provides an operations dashboard for
settlement batches and is ready to evolve into a full settlement workflow.

## Stack

- Runtime and package manager: Bun
- UI: React with TypeScript
- Build tool: Vite
- PWA support: `vite-plugin-pwa`
- Formatting and linting: Biome
- Unused dependency and file checks: Knip

## Getting Started

Install dependencies:

```sh
bun install
```

Run the development server:

```sh
bun run dev
```

Build the app:

```sh
bun run build
```

Run quality checks:

```sh
bun run lint
```

Format files:

```sh
bun run format
```

## Project Layout

- `src/App.tsx` contains the first application screen.
- `src/main.tsx` mounts React and registers the service worker.
- `src/styles.css` contains the app styles.
- `vite.config.ts` configures React and PWA generation.
- `biome.json` configures formatting and lint checks.
- `knip.json` configures unused code and dependency checks.
- `public/icon.svg` is the PWA icon source.

## Documentation Maintenance

Keep this README and `AGNETS.md` updated whenever scripts, tooling, app
structure, or development conventions change.
