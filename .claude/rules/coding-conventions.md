---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

## Coding Conventions

- Components -> PascalCase
- Hooks -> `useX` naming
- Domain models should come from Zod schemas (`z.infer`) when schemas exist; avoid duplicate manual domain types
- Use `import type` for type-only imports (mandatory)
- No business logic inside presentational components
- Containers orchestrate logic, components render UI
- Utilities must be pure functions
