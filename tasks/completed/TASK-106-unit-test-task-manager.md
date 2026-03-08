# TASK-106: Unit Tests for TaskManager Component

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | Medium       |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the `TaskManager` component in `src/components/task-manager.ts`. This component manages the task panel state including creating, updating, deleting, and rendering task items. Tests should use JSDOM or happy-dom for DOM assertions.

## Acceptance Criteria

- [ ] Test creating a new task adds it to the internal task list
- [ ] Test updating a task's status (e.g., pending to in_progress to completed)
- [ ] Test updating a task's description
- [ ] Test deleting a task removes it from the list
- [ ] Test rendering produces correct DOM structure for each task state
- [ ] Test rendering an empty task list shows an appropriate empty state or nothing
- [ ] Test `reset` clears all tasks and returns to initial state
- [ ] Test that duplicate task IDs are handled appropriately
- [ ] Test task ordering is preserved after updates
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/components/task-manager.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid (with DOM environment configured)
- `src/components/task-manager.ts` module must exist
- `src/types.ts` type definitions must exist
