---
paths:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
  - "src/test/**/*"
---

## Testing Rules

- Vitest + React Testing Library
- Focus on behavior, not implementation details
- Prefer RED-GREEN-REFACTOR for behavior changes, bug fixes, and domain logic. For docs/config/tiny visual changes, tests may be unnecessary.
- Test files live in `__tests__/` directories next to source
- Test factories live in `src/test/factories/`
- Run `npm run test` to verify — all tests must pass before committing
