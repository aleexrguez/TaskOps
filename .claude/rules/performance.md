## Performance — Code Splitting Rules

### Lazy Routes

Protected routes (`/app/tasks`, `/app/recurrences`, `/app/settings`) use `React.lazy()` + `Suspense`.
The `Suspense` boundary wraps `<Outlet />` in `AppShellLayout` — do NOT add per-route Suspense or duplicate providers.

### Barrel Import Safety

In files on the initial load path (`App.tsx`, `AppShellContainer`, `Router.tsx`) or inside lazy chunks:
- Do NOT import from barrels (`index.ts`) that re-export heavy components.
- Use direct file imports instead (e.g., `from '../components/ToastContainer'` not `from '../components'`).
- Barrels inside a lazy chunk are acceptable if they don't pull cross-feature heavy code.

### Heavy Dependencies — Must Stay Out of Initial Bundle

| Dependency | Isolated in | Loads when |
|------------|-------------|------------|
| `@dnd-kit/*` | `BoardView` chunk | User switches to board view |
| `react-day-picker` | `DatePicker` chunk | Form with date field opens |
| `canvas-confetti` | `confetti` chunk | Task marked done (dynamic import) |

Before adding imports of these libraries, verify they don't leak into the initial bundle via barrel re-exports or shared module imports.

### Verification

After any routing or import changes, run `npm run build` and check `dist/assets/` to confirm:
- Separate chunks for each lazy route
- Heavy deps NOT in `index-*.js` (main chunk) or `vendor-*.js`
