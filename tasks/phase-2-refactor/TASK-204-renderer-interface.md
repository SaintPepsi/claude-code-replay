# TASK-204: Define IRenderer Interface for Chat Rendering

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | TODO                                       |
| **Priority**| High                                       |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Architecture / Interface Design            |

## Description

Define an `IRenderer` interface (or set of interfaces) that decouples chat rendering consumers from concrete renderer implementations. Currently, components depend directly on the `ChatRenderer` class, creating tight coupling that makes it difficult to swap rendering strategies, test in isolation, or split the renderer into specialized sub-renderers.

The interface should define the contract for rendering conversation messages (user turns, assistant turns, tool use, tool results) without prescribing implementation details. This enables TASK-205 to split the monolithic `ChatRenderer` into role-specific renderers that each implement the same interface.

### Affected Files

- `src/types.ts` or new `src/interfaces/renderer.ts`
- `src/components/chat-renderer.ts` (implement interface)
- `src/main.ts` (depend on interface, not concrete class)

## Acceptance Criteria

- [ ] `IRenderer` interface is defined with methods for rendering each message type
- [ ] The interface uses domain types from `src/types.ts` for its parameters
- [ ] `ChatRenderer` implements `IRenderer` without breaking existing behavior
- [ ] Consumers in `main.ts` reference `IRenderer` rather than `ChatRenderer` directly
- [ ] The interface is generic enough to support alternative rendering strategies (e.g., virtualized, canvas-based)
- [ ] A `RenderContext` type is defined if renderers need shared state (container element, theme, etc.)
- [ ] Interface design supports both synchronous and asynchronous rendering

## Dependencies

- None (interface design can proceed independently)

## Design Principles Applied

- **Dependency Inversion Principle**: High-level modules (playback, main) depend on the `IRenderer` abstraction rather than the concrete `ChatRenderer` class. Concrete renderers depend on the interface, not the other way around.
