# TASK-115: E2E Tests for New File Button

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | Medium       |
| Assignee | Unassigned   |

## Description

Write failing Playwright end-to-end tests for the "New File" (or reset) button in Claude Code Replay. After loading a JSONL fixture file and advancing through some messages, these tests verify that clicking the new file button resets all application state and returns the user to the upload screen.

## Acceptance Criteria

- [ ] Test that the new file button is visible when a file is loaded
- [ ] Test that clicking the new file button returns to the upload screen
- [ ] Test that after reset, the playback controls are no longer visible
- [ ] Test that after reset, the progress bar is no longer visible or is cleared
- [ ] Test that after reset, the chat message area is cleared
- [ ] Test that after reset, the task panel is cleared
- [ ] Test that a new file can be loaded after reset (full round-trip)
- [ ] All tests are written using Playwright test runner
- [ ] Test file is located at `tests/e2e/new-file.spec.ts`

## Dependencies

- `playwright.config.ts` must be present and valid
- TASK-112 (file load tests; a JSONL fixture file must exist)
- TASK-113 (playback control tests confirm controls are functional before reset)
- The application must be buildable and serveable via Vite dev server
