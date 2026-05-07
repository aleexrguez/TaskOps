---
paths:
  - "src/features/task-manager/**/*"
  - "src/features/recurrences/**/*"
---

## TaskOps Sensitive Features

These areas have complex interactions. Extra care required.

### Kanban Board
- Drag & drop uses @dnd-kit/core + @dnd-kit/sortable
- Board ordering is persisted in the database — never lose order on rerender
- Empty columns must remain visible and droppable
- Optimistic updates on drag: update UI immediately, rollback on API failure

### Optimistic Updates
- Use optimistic updates for high-feedback interactions like drag & drop and inline edits when safe; always provide rollback on failure.
- Always implement rollback (onError) to restore previous state
- Invalidate related queries on settlement (onSettled)

### Recurring Tasks
- Templates define recurrence pattern (daily, weekly, monthly)
- Generation creates concrete tasks from templates
- Period keys are strings. Daily uses YYYY-MM-DD, weekly uses YYYY-Www, monthly uses YYYY-MM.
- Weekly templates support multi-day selection (weeklyDays array)
- Template delete/deactivate behavior must be planned carefully; never regenerate or delete generated tasks implicitly without explicit requirements and tests.

### Reminders
- Detect overdue / today / upcoming based on due_date
- Toast notifications with click-to-navigate
- Temporary highlight system on target task

### Task Detail
- Inline editing — no modal clutter
- Status transitions follow workflow: Todo -> In Progress -> Done
- Priority system: low, medium, high

### Accessibility
- Semantic HTML required (no div soup)
- Keyboard navigation for all interactive elements
- ARIA labels on drag handles, status changes, and actions
- Focus management on modal open/close and inline edit
