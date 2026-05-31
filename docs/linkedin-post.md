# TaskOps — LinkedIn Post Drafts

Three variations for different contexts and audiences. Choose one or mix sections.

---

## Variation 1 — Short (1 paragraph)

I built TaskOps from scratch: a full-stack SaaS task manager with React 19, TypeScript, Supabase, and Tailwind CSS 4. Feature-first architecture, React Query for server state, Zustand for UI state, Zod as the single source of truth for domain types. Kanban with drag and drop, recurring tasks, optimistic updates, code splitting, PWA, and i18n in English and Spanish. Eight domain features shipped with a clean separation of containers and presentational components — no shortcuts.

Live demo: https://taskops-project.vercel.app/
Source: https://github.com/aleexrguez/TaskOps

#React #TypeScript #Supabase #FrontendDevelopment #SideProject

---

## Variation 2 — Medium (3 paragraphs)

I spent the last few months building TaskOps — a full-stack SaaS task manager — as a deliberate exercise in doing things the right way, not the fast way.

The architecture is feature-first: each domain lives in its own slice (auth, tasks, recurrences, settings, and more), with a hard rule against cross-feature imports except through public barrel APIs. Server state is owned by React Query. UI-only state is owned by Zustand. Those two never cross. Zod schemas are the single source of truth for every domain type — no duplicate manual interfaces. Code splitting keeps heavy dependencies like the drag-and-drop library and the date picker out of the initial bundle.

The result: a kanban board with drag and drop, recurring task templates, optimistic updates, full CRUD, activity feeds, checklists, a report view, dark mode, PWA support, and i18n in English and Spanish. Built with React 19, TypeScript strict mode, Tailwind CSS 4, Supabase, and Vitest for testing.

Live demo: https://taskops-project.vercel.app/
Source: https://github.com/aleexrguez/TaskOps

#React #TypeScript #Supabase #TailwindCSS #ReactQuery #FrontendArchitecture #SideProject #WebDevelopment

---

## Variation 3 — Long (full post with bullet points)

I just shipped TaskOps — a full-stack SaaS task manager I built from scratch.

Not a tutorial clone. Not a CRUD demo. A real application with deliberate architectural decisions made at every layer.

Here is what I built and why it matters:

**Architecture**
- Feature-first folder structure: each domain is a self-contained slice (auth, tasks, recurrences, settings, reports, landing)
- Hard rule: no cross-feature imports except through a feature's public API (`index.ts`)
- Container/Presentational pattern enforced throughout — containers own data and logic, components own rendering and nothing else

**State management (strictly separated)**
- React Query v5 for all server state: fetching, caching, mutations, optimistic updates
- Zustand only for UI state that genuinely needs to be shared across unrelated components
- These two layers never overlap — a deliberate architectural constraint, not an accident

**Type safety**
- Zod v4 as the single source of truth for domain models — `z.infer` generates types, no duplicate interfaces
- TypeScript strict mode throughout, no `any`, explicit return types on all exported functions

**Performance**
- Lazy loading for all protected routes via `React.lazy` and `Suspense`
- Heavy dependencies (drag-and-drop, date picker, confetti) isolated in their own chunks
- Initial bundle stays lean regardless of how many features ship

**Features shipped**
- Kanban board with drag and drop (dnd-kit)
- Recurring task templates with grouped view and rule management
- Task detail with checklist, activity feed, and due date countdown
- Optimistic updates on all mutations
- Dark and light mode with smooth transition
- PWA (installable, offline shell)
- i18n in English and Spanish
- Accessibility-first components including a Board Move menu as an alternative to drag and drop

**Testing**
- Vitest + React Testing Library
- Tests written against behavior, not implementation

Eight domain features. One codebase. No shortcuts.

Live demo: https://taskops-project.vercel.app/
Source: https://github.com/aleexrguez/TaskOps

---

What is one architectural decision you made on a side project that you are proud of? I would like to hear it.

#React #ReactQuery #TypeScript #Supabase #TailwindCSS #Zustand #Zod #FrontendDevelopment #FrontendArchitecture #WebDevelopment #SideProject #OpenSource #PWA #SoftwareEngineering

---

## Posting Tips

**Formatting note:** LinkedIn does not render markdown. Before posting, remove all `**bold**` markers or replace them with plain text capitalization or line breaks for emphasis. The bullet points (`-`) render as plain hyphens — use them as-is or replace with LinkedIn's native line spacing.

**Best time to post:** Tuesday through Thursday, 8-10am or 5-6pm in your local timezone. Avoid Mondays and Fridays.

**First comment:** Post the GitHub URL and live demo link again in the first comment immediately after publishing. LinkedIn suppresses reach on posts with external links in the body — putting the link in the first comment recovers some of that reach while keeping it accessible.

**Engagement hook:** The question at the end of Variation 3 ("What is one architectural decision...") is intentional. LinkedIn's algorithm rewards posts that generate comments in the first hour. Ask a genuine question you would actually want answered.

**Hashtag count:** Three to five hashtags outperform ten or more on LinkedIn. For the short and medium variants, trim the list to the five most relevant to your target audience.
