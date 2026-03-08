# TASK-101: Unit Tests for escHtml Utility

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | High         |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the `escHtml` utility in `src/utils/escHtml.ts`. This function escapes HTML special characters to prevent XSS and ensure safe rendering of user-provided content. Tests should cover all standard HTML entities and edge cases.

## Acceptance Criteria

- [ ] Test that `&` is escaped to `&amp;`
- [ ] Test that `<` is escaped to `&lt;`
- [ ] Test that `>` is escaped to `&gt;`
- [ ] Test that `"` is escaped to `&quot;`
- [ ] Test that `'` is escaped to `&#039;` (or equivalent)
- [ ] Test that a string containing multiple special characters is fully escaped
- [ ] Test that a string with no special characters is returned unchanged
- [ ] Test that an empty string returns an empty string
- [ ] Test that numeric and boolean-coercible inputs are handled gracefully
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/utils/escHtml.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid
- `src/utils/escHtml.ts` module must exist (even if not yet implemented)
