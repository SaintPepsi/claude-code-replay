# TASK-113: E2E Tests for Playback Controls

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | High         |
| Assignee | Unassigned   |

## Description

Write failing Playwright end-to-end tests for the playback controls in Claude Code Replay. After loading a JSONL fixture file, these tests verify that play/pause, step forward, speed adjustment, and keyboard shortcuts work correctly in the browser.

## Acceptance Criteria

- [ ] Test that clicking the play button starts auto-advancing through messages
- [ ] Test that clicking pause stops auto-advance and holds the current position
- [ ] Test that clicking the step button advances exactly one message
- [ ] Test that multiple step clicks advance the expected number of messages
- [ ] Test that changing the speed selector updates the playback rate
- [ ] Test keyboard shortcut for play/pause (Space)
- [ ] Test keyboard shortcut for step forward (ArrowRight)
- [ ] Test keyboard shortcut for step backward (ArrowLeft), if supported
- [ ] Test that the play button label/icon toggles between play and pause states
- [ ] Test that reaching the last message stops playback automatically
- [ ] All tests are written using Playwright test runner
- [ ] Test file is located at `tests/e2e/playback-controls.spec.ts`

## Dependencies

- `playwright.config.ts` must be present and valid
- TASK-112 (file load tests; a JSONL fixture file must exist)
- The application must be buildable and serveable via Vite dev server
