# TASK-303: Run All Playwright E2E Tests

| Field       | Value        |
|-------------|--------------|
| **Status**  | TODO         |
| **Priority**| High         |
| **Assignee**| Unassigned   |
| **Phase**   | 3 - Verify All Tests Pass |

## Description

Run the full Playwright end-to-end test suite against the Vite dev server (or preview build). Capture all results including pass/fail counts, screenshots, and trace files for any failures. E2E tests validate that the application works correctly from a user perspective after the Vite + TypeScript conversion.

## Acceptance Criteria

- [ ] Vite dev server or preview server is started before test execution
- [ ] All Playwright e2e tests are executed via `npx playwright test`
- [ ] Full test output is captured (stdout and stderr)
- [ ] Pass count, fail count, and skip count are recorded
- [ ] Screenshots and/or trace files are saved for any failing tests
- [ ] Any failing test names, error messages, and screenshots are documented
- [ ] Results are saved to a test results artifact for reference by downstream tasks

## Dependencies

- Phase 1 conversion tasks must be complete
- Phase 2 migration tasks must be complete
- TASK-307 (build verification) should ideally pass first, but is not strictly blocking
- Playwright must be installed with browsers (`npx playwright install`)
