# AGENTS.md

This project is a Bun-managed React, TypeScript, Vite PWA. The current product
direction is a mobile-first settlement app with a fixed `돈줘` header, icon-only
floating tabs, and a Supabase-backed Home spending timeline. Keep this file and
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
- Supabase JS is configured in `src/backend/supabase.ts`.
- Use the `@/` import alias for source files.
- Local Supabase credentials belong in `.env.local`; never commit real Supabase
  keys.
- Use `VITE_SUPABASE_PUBLISHABLE_KEY` for client-side Supabase access.

## App Structure

- `src/App.tsx` contains the current app screen composition.
- Shared UI belongs in `src/components/common`.
- Fixed screen titles use `ScreenHeader`; floating screen back actions use
  `BackButton`.
- Floating picker overlays use shared components such as `FloatingPicker` and
  `FloatingDatePicker`.
- `src/components/screens/home/index.tsx` owns the root Home screen and its
  Summary, Send, and Receive tabs, including Send and Receive target person
  pickers.
- Home screen tab content belongs in `src/components/screens/home/fragments`.
- Pushed screen UI, such as activity-like detail screens, belongs in
  `src/components/screens`.
- `src/components/screens/expense-add` owns the pushed expense creation form.
- App-level screen state types live in `src/App.tsx`; Home tab button metadata
  lives in `src/components/screens/home/index.tsx`.
- Home spending summary helpers live in `src/features/home`.
- The Home screen has three tabs: Summary, Send, and Receive.
- The Send tab target sender is selected from the fixed title using people from
  the `Person` table.
- The Send tab lists expenses where the selected target sender is a debtor,
  hides `ExpenseDebtor` rows with `settlementStatus` of `SETTLED`, and shows
  `SETTLING` rows as disabled `송금 확인중` items.
- The Receive tab target receiver is selected from the fixed title using people
  from the `Person` table.
- The Receive tab lists expenses paid by the selected receiver, grouped by
  debtor, and hides `ExpenseDebtor` rows with `settlementStatus` of `SETTLED`.
- The Home timeline has a `자세히 보기` action that opens the `공금 사용 내역`
  expense history screen.
- The expense history screen has a floating Add action that opens the
  `지출 추가` screen.
- The floating bottom navigation is icon-only. Preserve `aria-label` values for
  accessibility when changing tab buttons.
- The fixed header shows `돈줘`. Its fade is applied to the H1 text itself.
- The Home screen shows the total spending summary above the timeline and lists
  weekly items from latest to oldest.

## Supabase Data Rules

- Keep backend table interfaces in `src/backend/schema.ts`.
- Keep typed Supabase reads and writes under `src/backend`.
- Prefer `getBackendSnapshot` from `src/backend/queries.ts` for the current
  client-side snapshot.
- Expense rows use `title` for the visible label and optional `description` for
  detail text.
- Expense UI receives `BackendSnapshot | null`; `null` is the loading state and
  remains as a rotating spinner when config or fetch fails.
- The Home screen treats real expense in won as
  `expense.cost * expense.exchange`. If the exchange value is missing or `0`, it
  falls back to `expense.cost`.
- The expense history screen lists the same real expense amount in won.
- Week 1 starts on Monday, June 22, 2026. Additional weeks are generated from
  Monday starts through the current week.

## Code Guidelines

- Write new application code in TypeScript.
- Prefer React function components and typed local data structures.
- Keep UI components accessible with semantic elements and labels.
- Keep the app mobile-first and consistent with the current iOS-style UI.
- Do not reintroduce the old dashboard layout unless explicitly requested.
- Update the PWA manifest details when the product name, icon, colors, or app
  description changes.
