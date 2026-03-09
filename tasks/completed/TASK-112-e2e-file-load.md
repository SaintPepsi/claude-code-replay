# TASK-112: E2E Tests for File Load

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | High         |
| Assignee | Unassigned   |

## Description

Write failing Playwright end-to-end tests for loading a JSONL conversation file into Claude Code Replay. These tests verify the screen transition from the upload view to the playback view, correct display of message count, and proper initialization of the progress bar ticks.

## Acceptance Criteria

- [ ] Test that uploading a valid JSONL fixture file transitions away from the upload screen
- [ ] Test that the playback view becomes visible after file load
- [ ] Test that the message count indicator displays the correct total number of messages
- [ ] Test that progress bar ticks are rendered matching the number of conversation messages
- [ ] Test that the first message is displayed or the playback is at position 0
- [ ] Test that playback controls (play, step, speed) become visible after file load
- [ ] Test that uploading an empty file shows an error or remains on the upload screen
- [ ] A JSONL fixture file is created in `tests/fixtures/` for use by this and other E2E tests
- [ ] All tests are written using Playwright test runner
- [ ] Test file is located at `tests/e2e/file-load.spec.ts`

## Dependencies

- `playwright.config.ts` must be present and valid
- TASK-111 (upload screen tests establish baseline for initial state)
- A representative JSONL fixture file must be created
