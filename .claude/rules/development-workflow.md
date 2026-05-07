---
paths:
  - "src/features/**/*"
---

## Development Workflow

### Execution Order

1. **Architecture** — define files, responsibilities, feature boundaries before coding
2. **Tests** — add or update tests for behavior changes, bug fixes, domain logic, and regressions
3. **Implementation** — minimum code to pass tests, follow architecture strictly
4. **Refactor** — improve naming/structure/readability, keep tests green

### Rules

- No feature without architecture review
- No skipping lint/format
- No mixing domain and API logic
- No global state for server data
- Do not commit or push unless explicitly asked
