# TASK-105: Unit Tests for Tool Summary Helpers

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | Medium       |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the tool summary helper functions in `src/parser/tool-summary.ts`. This module provides `getToolSummary`, `getToolCommand`, and `isTaskTool` functions used to extract human-readable names and summaries from tool-use blocks in the conversation data.

## Acceptance Criteria

- [ ] Test `getToolSummary` returns a descriptive summary for known tool names (e.g., Read, Write, Bash, Grep, Glob)
- [ ] Test `getToolSummary` returns a sensible fallback for unknown tool names
- [ ] Test `getToolSummary` handles tool input parameters to produce contextual summaries (e.g., file path for Read)
- [ ] Test `getToolCommand` returns the primary command or action string from a tool-use block
- [ ] Test `getToolCommand` handles missing or empty input gracefully
- [ ] Test `isTaskTool` returns `true` for task-related tool names (e.g., TodoWrite, TaskManager)
- [ ] Test `isTaskTool` returns `false` for non-task tool names
- [ ] Test all functions handle `undefined` and `null` inputs without throwing
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/parser/tool-summary.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid
- `src/parser/tool-summary.ts` module must exist
- `src/types.ts` type definitions must exist
