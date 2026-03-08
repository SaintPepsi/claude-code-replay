# TASK-104: Unit Tests for JSONL Parser

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | High         |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the JSONL conversation parser in `src/parser/jsonl-parser.ts`. This module reads newline-delimited JSON input, parses each line into structured conversation messages, maps tool results to their originating calls, deduplicates messages, and returns a sorted array. Tests should cover valid input, malformed data, and edge cases.

## Acceptance Criteria

- [ ] Test parsing a single valid JSONL line into a structured message
- [ ] Test parsing multiple valid JSONL lines
- [ ] Test that malformed JSON lines are skipped or handled gracefully without throwing
- [ ] Test that empty lines in input are ignored
- [ ] Test tool result messages are correctly mapped to their originating tool_use calls
- [ ] Test message deduplication (duplicate message IDs are collapsed)
- [ ] Test that output messages are sorted in chronological order
- [ ] Test parsing of different message roles (user, assistant, system)
- [ ] Test parsing of messages with nested content blocks (text, tool_use, tool_result)
- [ ] Test completely empty input returns an empty array
- [ ] Test input with only whitespace or blank lines returns an empty array
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/parser/jsonl-parser.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid
- `src/parser/jsonl-parser.ts` module must exist
- `src/types.ts` type definitions must exist
