# TASK-114: E2E Tests for Progress Bar

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | Medium       |
| Assignee | Unassigned   |

## Description

Write failing Playwright end-to-end tests for the progress bar interactions in Claude Code Replay. After loading a JSONL fixture file, these tests verify that clicking on the progress bar seeks to the correct position, dragging seeks smoothly, and the visual fill updates to reflect the current playback position.

## Acceptance Criteria

- [ ] Test that clicking on the progress bar at the midpoint seeks to approximately the middle message
- [ ] Test that clicking at the start of the progress bar seeks to the first message
- [ ] Test that clicking at the end of the progress bar seeks to the last message
- [ ] Test that dragging across the progress bar updates the current position in real time
- [ ] Test that the visual fill (highlighted portion) of the progress bar matches the current position
- [ ] Test that the fill updates correctly after step forward
- [ ] Test that the fill updates correctly during auto-play
- [ ] Test that the current message indicator reflects the seeked position
- [ ] All tests are written using Playwright test runner
- [ ] Test file is located at `tests/e2e/progress-bar.spec.ts`

## Dependencies

- `playwright.config.ts` must be present and valid
- TASK-112 (file load tests; a JSONL fixture file must exist)
- The application must be buildable and serveable via Vite dev server
