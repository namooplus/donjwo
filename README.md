# Yugain Settlement

Yugain Settlement is a PWA application scaffolded with React, TypeScript, Vite,
Bun, Biome, and Knip.

The app is a mobile-first settlement experience backed by Supabase. It currently
focuses on public fund spending, transfer, and receive flows.

## Stack

- Runtime and package manager: Bun
- UI: React with TypeScript
- Build tool: Vite
- PWA support: `vite-plugin-pwa`
- Source import alias: `@/`
- Backend client: Supabase JS
- Formatting and linting: Biome
- Unused dependency and file checks: Knip

## Getting Started

Copy the environment template and fill in your Supabase project values:

```sh
cp .env.example .env.local
```

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

- `src/backend/schema.ts` defines the backend contract for Supabase tables.
- `src/backend/supabase.ts` creates the typed Supabase client from Vite env
  variables.
- `src/backend/queries.ts` contains typed Supabase table reads.
- `src/App.tsx` contains the current application shell composition.
- `src/components/common` contains shared UI components.
- `ScreenHeader`, `BackButton`, and `FloatingPicker` provide shared screen
  chrome and overlays.
- `src/components/screens/home/index.tsx` contains the root Home screen and the
  Send/Receive tab target person pickers.
- `src/components/screens/home` contains Summary, Send, and Receive tab
  content.
- `src/components/screens` also contains pushed screen components.
- `src/features/home` contains Home spending summary helpers.
- `src/main.tsx` mounts React and registers the service worker.
- `src/styles.css` contains the app styles.
- `vite.config.ts` configures React and PWA generation.
- `biome.json` configures formatting and lint checks.
- `knip.json` configures unused code and dependency checks.
- `AGENTS.md` contains project-specific instructions for coding agents.
- `public/icon.svg` is the PWA icon source.

## Backend Contract

Supabase is configured through `@supabase/supabase-js`. Set these values in
`.env.local`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

`VITE_SUPABASE_ANON_KEY` is still accepted as a temporary compatibility
fallback, but new local env files should use the publishable-key name.

Live Supabase tables:

- `Person`: `id`, `name`
- `Exchange`: `id`, `name`, `value`
- `Expense`: `id`, `name`, `index`, `date`, `payer`, `cost`, `exchange`
- `ExpenseDebtor`: `expense`, `debtor`
- `ExpenseSender`: `expense`, `sender`, `verified`

The requested `debtor`, `sender`, and `verifiedSender` application concepts are
represented in the live database through `ExpenseDebtor` and `ExpenseSender`.
`verifiedSender` is derived from `ExpenseSender` rows where `verified` is true.

Use `getSupabaseClient` from `src/backend/supabase.ts` when adding queries.
Use `getBackendSnapshot` from `src/backend/queries.ts` when reading the current
client-side snapshot.
Expense UI treats a missing snapshot as loading, including config or fetch
failure cases.

The Send tab target sender is selected from `Person` rows. It lists expenses
where that person is a debtor, hides expenses with a verified `ExpenseSender`
row for that person, and shows unverified sender rows as pending confirmation.
The Receive tab target receiver is selected from `Person` rows. It lists
expenses paid by that person, grouped by debtor, and hides verified
`ExpenseSender` rows.

## Documentation Maintenance

Keep this README and `AGENTS.md` updated whenever scripts, tooling, app
structure, or development conventions change.
