# TASK-107: Unit Tests for ChatRenderer Component

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | High         |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the `ChatRenderer` component in `src/components/chat-renderer.ts`. This component is responsible for rendering chat messages into DOM elements, including tool calls, tool results, user messages, and assistant messages. Tests should cover each render method and verify correct DOM output.

## Acceptance Criteria

- [ ] Test `renderToolCall` produces correct DOM structure with tool name and parameters
- [ ] Test `renderToolCall` handles collapsed/expanded state
- [ ] Test `renderToolResult` produces correct DOM structure with result content
- [ ] Test `renderToolResult` handles error results distinctly
- [ ] Test `renderBlockInstant` renders a content block immediately without animation
- [ ] Test `renderUserInstant` renders a user message with proper styling and structure
- [ ] Test `renderAssistantInstant` renders an assistant message with markdown-processed content
- [ ] Test that rendered messages include appropriate role indicators or CSS classes
- [ ] Test rendering with empty or missing content does not throw
- [ ] Test that HTML in message content is properly escaped (not rendered as raw HTML)
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/components/chat-renderer.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid (with DOM environment configured)
- `src/components/chat-renderer.ts` module must exist
- `src/utils/markdown.ts` must exist (ChatRenderer depends on markdown conversion)
- `src/utils/escHtml.ts` must exist
- `src/types.ts` type definitions must exist
