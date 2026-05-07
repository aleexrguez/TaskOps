# TaskOps — Project Instructions

## Architecture: Feature-First + Scope Rule

- GLOBAL: shared across 2+ features -> `src/shared/`
- FEATURE: encapsulated, domain-specific -> `src/features/{name}/`
- No cross-feature imports (only via shared/)

## Project Structure

```
src/
├── features/           # Domain features
│   └── {feature}/
│       ├── api/        # API client + DTOs
│       ├── components/ # Presentational components
│       ├── containers/ # Smart components (data + logic)
│       ├── hooks/      # React Query + feature hooks
│       ├── store/      # Zustand (UI-only state)
│       ├── types/      # Domain models (Zod source of truth)
│       ├── utils/      # Pure functions
│       └── index.ts    # Public API (barrel)
├── shared/             # Global reusable modules
├── router/             # Routing layer
├── providers/          # React providers
├── app/                # App bootstrap
├── test/               # Test utilities + factories
```

## Tech Stack

- React 19 + TypeScript
- React Query v5 (server state)
- Zustand (UI state only — never for server data)
- Zod v4 (validation + typing, single source of truth)
- Tailwind CSS v4
- Supabase (Auth + Database)
- Vitest + React Testing Library
- ESLint + Prettier

## Key Invariants

- Domain models should come from Zod schemas (`z.infer`) when schemas exist; avoid duplicate manual domain types
- UI state (Zustand) != Server state (React Query) — strictly separated
- API layer separated from domain logic
- Avoid cross-feature imports. If unavoidable, import only from the feature public API (`index.ts`), never from internal files.
- Move code to `src/shared/` only when reused by 2+ features.
- No business logic in presentational components
- Containers orchestrate logic, components render UI

## Features

| Feature | Path | Description |
|---------|------|-------------|
| auth | src/features/auth/ | Authentication + password reset |
| landing | src/features/landing/ | Landing page |
| recurrences | src/features/recurrences/ | Recurring task templates + generation |
| settings | src/features/settings/ | User settings + theme |
| task-manager | src/features/task-manager/ | Core tasks: CRUD, kanban, filtering |

## Scripts

- `npm run dev` — dev server
- `npm run build` — tsc + vite build
- `npm run test` — vitest run
- `npm run test:watch` — vitest watch
- `npm run lint` — ESLint
- `npm run lint:fix` — ESLint --fix
- `npm run format` — Prettier write
- `npm run format:check` — Prettier check
- `npx tsc --noEmit` — type check only

## Pre-Commit Checklist

Run before every commit:
1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run test`
4. `npm run build`
5. `npm run format:check` (when formatting was touched)

## Supabase Conventions

- `due_date` column is DATE — always cast with `::date` in SQL
- `recurrence_date_key` is TEXT — cast with `::date` for comparisons
- API layer lives in `features/{name}/api/` — separated from domain
