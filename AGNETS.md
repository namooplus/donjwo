# AGNETS.md

This project is a Bun-managed React, TypeScript, Vite PWA. Keep this file and
`README.md` current as the project evolves.

## Commands

- Install dependencies: `bun install`
- Start development server: `bun run dev`
- Build for production: `bun run build`
- Run lint and unused-code checks: `bun run lint`
- Format files: `bun run format`

## Tooling

- Use Bun for dependency management and script execution.
- Use Biome for formatting and linting.
- Use Knip to catch unused files, exports, and dependencies.
- PWA generation is configured through `vite-plugin-pwa` in `vite.config.ts`.

## Code Guidelines

- Write new application code in TypeScript.
- Prefer React function components and typed local data structures.
- Keep UI components accessible with semantic elements and labels.
- Update the PWA manifest details when the product name, icon, colors, or app
  description changes.
