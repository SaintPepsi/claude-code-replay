# TASK-102: Unit Tests for Credential Redaction

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | High         |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the credential redaction module in `src/utils/redact.ts`. This module replaces sensitive credentials (API keys, tokens, passwords, secrets) in text with redacted placeholders. Tests should verify that all supported credential patterns are detected and redacted while non-sensitive content is preserved.

## Acceptance Criteria

- [ ] Test redaction of API key patterns (e.g., `sk-ant-...`, `sk-...`, `AKIA...`)
- [ ] Test redaction of bearer tokens
- [ ] Test redaction of password-like strings in key-value contexts
- [ ] Test redaction of base64-encoded secret patterns
- [ ] Test that normal prose text is not altered
- [ ] Test that code snippets without real credentials are not over-redacted
- [ ] Test input with multiple credentials on different lines
- [ ] Test empty and whitespace-only input
- [ ] Test that the redaction placeholder is consistent and recognizable
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/utils/redact.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid
- `src/utils/redact.ts` module must exist
