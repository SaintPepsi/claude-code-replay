# TASK-304: Fix Any Failing E2E Tests from Phase 1

| Field       | Value        |
|-------------|--------------|
| **Status**  | DONE         |
| **Priority**| High         |
| **Assignee**| Unassigned   |
| **Phase**   | 3 - Verify All Tests Pass |

## Description

Review and fix all Playwright e2e test failures identified in TASK-303. E2E failures may result from changed DOM structure, updated selectors, Vite dev server differences (e.g., different base URL or asset paths), or behavioral regressions. Use Playwright traces and screenshots to diagnose each failure.

## Acceptance Criteria

- [ ] Every failing e2e test from TASK-303 is investigated
- [ ] Root cause of each failure is identified and documented
- [ ] Playwright traces and screenshots are reviewed for each failure
- [ ] Fixes are applied to source code, test code, or Playwright config as appropriate
- [ ] Selectors are updated if DOM structure changed during conversion
- [ ] All previously failing e2e tests now pass when re-run with `npx playwright test`
- [ ] No previously passing e2e tests have been broken by the fixes
- [ ] Changes are committed with clear commit messages referencing this task

## Dependencies

- TASK-303 (run e2e tests and capture results)
