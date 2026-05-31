# TaskOps

A production-grade task management application built with React 19 and TypeScript. TaskOps covers the full lifecycle of personal productivity: quick capture via inbox, structured task management with kanban boards, recurring task templates, analytics reports, and multi-language support — all backed by Supabase and deployed as a PWA.

Live demo: https://taskops-project.vercel.app/

---

## Features

### Authentication

- Login, register, forgot password, and reset password flows
- Demo login — a read-only account for trying features without registering

### Inbox

- Quick capture input with a personalized greeting
- Inline edit and delete for inbox items
- Batch convert inbox items into tasks

### Task Manager

- Full CRUD with status workflow: `todo`, `in-progress`, `done`
- Priority levels: low, medium, high
- Due dates with countdown badge (overdue, today, upcoming)
- List view with filters and full-text search
- Board view (kanban) with drag and drop via @dnd-kit and an accessible board move menu as an alternative
- Task detail view with checklist, activity timeline, and due date countdown
- Archive and unarchive; auto-purge based on configurable retention policy
- Overdue, today, and upcoming reminders delivered as toast notifications
- Confetti animation on task completion

### Reports

- Weekly and monthly task analytics
- Summary cards and breakdown by status

### Recurrences

- Templates for daily, weekly (multi-day), monthly (with lead time), and yearly recurrences
- Automatic generation of task instances from templates
- Grouped display by frequency

### Settings

- Theme: light, dark, or system
- Language: English or Spanish (Rioplatense)
- Data retention policy: 3 days to never
- Due date reminders toggle
- Animated background toggle

### Account

- Display name editor
- Avatar upload and removal (Supabase Storage)
- Change password
- Delete account with confirmation dialog

### Legal

- Privacy Policy, Terms of Service, Cookie Policy, and Legal Notice pages

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| UI | React | ^19.2.4 |
| Language | TypeScript | ~5.9.3 |
| Build tool | Vite | ^8.0.1 |
| Routing | react-router-dom | ^7.13.2 |
| Server state | @tanstack/react-query | ^5.96.0 |
| UI state | Zustand | ^5.0.12 |
| Validation / types | Zod | ^4.3.6 |
| Styling | Tailwind CSS | ^4.2.2 |
| Backend | @supabase/supabase-js | ^2.103.0 |
| Drag and drop | @dnd-kit/core | ^6.3.1 |
| Date picker | react-day-picker | ^10.0.0 |
| Date utilities | date-fns | ^4.1.0 |
| i18n | i18next + react-i18next | ^26.2.0 / ^17.0.8 |
| PWA | vite-plugin-pwa | ^1.3.0 |
| Confetti | canvas-confetti | ^1.9.4 |
| Testing | Vitest | ^4.1.2 |
| Testing | @testing-library/react | ^16.3.2 |

---

## Architecture Highlights

### Feature-first structure with a scope rule

Code lives in `src/features/{name}/` by default. It moves to `src/shared/` only when two or more features need it. Cross-feature imports are only allowed through a feature's public barrel (`index.ts`), never from internal files.

### Container/presentational pattern

Containers own data fetching, state, and business logic. Presentational components receive props and return JSX — no direct store access, no API calls, no transformations.

### Strict state separation

React Query handles all server state (fetching, caching, mutations, optimistic updates with rollback). Zustand handles UI-only state that needs to be shared across unrelated components. These two concerns never mix.

### Zod as single source of truth

Domain types are derived from Zod schemas via `z.infer<>`. There are no duplicate manual type definitions alongside schemas.

### Code splitting

Protected routes (`/app/*`) are loaded with `React.lazy()` + `Suspense`. Heavy dependencies are isolated in their own chunks and never pulled into the initial bundle:

| Dependency | Loads when |
|---|---|
| @dnd-kit/core | User opens board view |
| react-day-picker | A date field is opened |
| canvas-confetti | Task is marked done |

### PWA

A service worker is registered via `vite-plugin-pwa`. The app is installable and supports offline-first asset caching.

### i18n

Full English and Spanish (Rioplatense) support via `i18next`. Language preference is persisted in user settings.

---

## Screenshots

Screenshots coming soon.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Supabase project (free tier works)

### Clone and install

```bash
git clone https://github.com/aleexrguez/TaskOps.git
cd TaskOps
npm install
```

### Environment variables

Create a `.env` file at the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ANALYTICS_ENABLED=false
```

### Start the dev server

```bash
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run test` | Run all tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format source files with Prettier |
| `npm run format:check` | Check formatting without writing |

---

## Analytics

TaskOps uses a custom Supabase-based analytics system. Events are stored in the `analytics_events` table (append-only). The table is queryable via the Supabase dashboard using the `service_role` key.

### Tracked events

| Event | Description |
|---|---|
| `landing_viewed` | Landing page visited |
| `demo_started` | User navigates to demo login |
| `auth_modal_opened` | Login or register page visited |
| `feedback_submitted` | Feedback form submitted |
| `task_created` | Task created (including duplicates) |
| `task_completed` | Task transitioned to done |
| `board_viewed` | Kanban board rendered or toggled to |
| `recurrence_viewed` | Recurrences page visited |
| `inbox_task_created` | Inbox item created |

### What is not tracked

- Task content, titles, or descriptions
- Email addresses or display names
- No cookies used for tracking
- No external analytics vendor or third-party SDK

### Activation

Analytics is disabled by default. To enable it:

```env
VITE_ANALYTICS_ENABLED=true
```

To opt out your own browser in production (suppress internal traffic):

```js
localStorage.setItem('taskops.analytics.optOut', 'true')
```

To re-enable:

```js
localStorage.removeItem('taskops.analytics.optOut')
```

### Privacy note

`user_id` is stored as an opaque UUID assigned server-side via `auth.uid()`. It is a pseudonymous identifier — no direct PII is collected by the analytics system. This is disclosed in the Privacy Policy and Legal Notice pages of the application.

---

## Navigation

| Path | Description |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password (from email link) |
| `/demo` | Demo login |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/cookies` | Cookie Policy |
| `/legal` | Legal Notice |
| `/app/inbox` | Inbox (quick capture) |
| `/app/tasks` | Task list and board view |
| `/app/tasks/:id` | Task detail |
| `/app/recurrences` | Recurrence templates |
| `/app/reports` | Analytics reports |
| `/app/settings` | User preferences |
| `/app/account` | Profile and account management |

---

## Roadmap

- Projects and workspaces — group tasks by project with shared context
- Task sharing and permissions — viewer, editor, and owner roles
- AI features — task breakdown suggestions and priority recommendations

---

## License

MIT
