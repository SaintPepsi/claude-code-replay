# TASK-205: Split ChatRenderer into Role-Specific Renderers

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| Medium                                     |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Split the monolithic `ChatRenderer` class into three focused renderers, each responsible for a single message role:

- **UserRenderer** - Renders user/human turn messages
- **AssistantRenderer** - Renders assistant text responses, including markdown processing
- **ToolRenderer** - Renders tool_use and tool_result blocks (code blocks, file contents, diffs, etc.)

A coordinating `CompositeRenderer` (or the refactored `ChatRenderer`) delegates to the appropriate sub-renderer based on message role. Each sub-renderer implements the `IRenderer` interface from TASK-204 and can be developed and tested independently.

### Affected Files

- `src/components/chat-renderer.ts` (refactor into coordinator)
- New: `src/components/renderers/user-renderer.ts`
- New: `src/components/renderers/assistant-renderer.ts`
- New: `src/components/renderers/tool-renderer.ts`

## Acceptance Criteria

- [ ] `UserRenderer` handles all user message rendering logic
- [ ] `AssistantRenderer` handles assistant text and markdown rendering logic
- [ ] `ToolRenderer` handles tool_use and tool_result rendering logic
- [ ] Each sub-renderer implements `IRenderer` (or a role-specific sub-interface)
- [ ] A coordinator class delegates to the correct sub-renderer based on message role
- [ ] No rendering logic is duplicated across sub-renderers
- [ ] The rendered output is visually identical to the current implementation
- [ ] Each sub-renderer can be unit tested in isolation with mock DOM
- [ ] Sub-renderers receive dependencies via constructor injection, not global imports

## Dependencies

- **TASK-203**: DOM helpers should be available for use in sub-renderers
- **TASK-204**: The `IRenderer` interface must be defined first

## Design Principles Applied

- **Single Responsibility Principle**: Each renderer handles exactly one message role. Changes to tool rendering cannot accidentally break user message rendering.
