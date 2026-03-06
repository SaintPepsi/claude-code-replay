# TASK-110: Unit Tests for ProgressBar Component

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | Medium       |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the `ProgressBar` component in `src/components/progress-bar.ts`. This component builds tick marks on the progress bar representing conversation messages, clears ticks on reset, and manages drag state for seek interactions.

## Acceptance Criteria

- [ ] Test `buildTicks` creates the correct number of tick elements for a given message count
- [ ] Test `buildTicks` assigns appropriate CSS classes or data attributes to ticks based on message type
- [ ] Test `buildTicks` with zero messages produces no ticks
- [ ] Test `buildTicks` with a single message produces one tick
- [ ] Test `clearTicks` removes all tick elements from the DOM
- [ ] Test `setDragging(true)` adds a dragging CSS class or state indicator
- [ ] Test `setDragging(false)` removes the dragging CSS class or state indicator
- [ ] Test that tick positions are distributed proportionally across the bar width
- [ ] Test that calling `buildTicks` a second time replaces previous ticks (no duplicates)
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/components/progress-bar.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid (with DOM environment configured)
- `src/components/progress-bar.ts` module must exist
