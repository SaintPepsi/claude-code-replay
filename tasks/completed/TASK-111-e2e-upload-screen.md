# TASK-111: E2E Tests for Upload Screen

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | High         |
| Assignee | Unassigned   |

## Description

Write failing Playwright end-to-end tests for the upload screen of Claude Code Replay. These tests verify the initial application state when no file is loaded: the upload drop zone is visible, the playback controls are hidden, and the drop zone responds to hover interactions.

## Acceptance Criteria

- [ ] Test that the upload screen is displayed on initial page load
- [ ] Test that the drop zone element is visible and contains instructional text
- [ ] Test that playback controls are not visible on the upload screen
- [ ] Test that the progress bar is not visible on the upload screen
- [ ] Test that hovering over the drop zone (simulating dragover) applies a visual hover indicator
- [ ] Test that the file input element exists and accepts `.jsonl` files
- [ ] Test that clicking the drop zone or a button triggers the hidden file input
- [ ] All tests are written using Playwright test runner
- [ ] Test file is located at `tests/e2e/upload-screen.spec.ts`

## Dependencies

- `playwright.config.ts` must be present and valid
- The application must be buildable and serveable via Vite dev server
- No fixture files required (tests verify empty/initial state)
