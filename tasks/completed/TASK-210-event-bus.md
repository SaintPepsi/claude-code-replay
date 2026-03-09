# TASK-210: Create Typed EventBus for Component Communication

| Field       | Value                                      |
|-------------|-------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| High                                       |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Architecture / Infrastructure              |

## Description

Create a strongly-typed `EventBus` that serves as the central communication backbone between components, replacing direct DOM event coupling and tight inter-component references.

Currently, components communicate by holding direct references to each other or by dispatching/listening to custom DOM events on shared elements. This creates implicit coupling where changing one component's API forces changes in all its consumers.

The `EventBus` should:

- Define a typed event map where each event name maps to a specific payload type, providing compile-time safety for both publishers and subscribers.
- Support `emit(event, payload)`, `on(event, handler)`, and `off(event, handler)` operations.
- Support one-time listeners via `once(event, handler)`.
- Optionally support namespaced events for easier bulk unsubscription (e.g., `off('playback:*')`).
- Be a plain TypeScript class with no DOM dependency, enabling use in tests and non-browser contexts.

### Event Categories

| Category     | Example Events                                      |
|-------------|-----------------------------------------------------|
| **File**     | `file:loaded`, `file:error`                         |
| **Playback** | `playback:play`, `playback:pause`, `playback:seek`, `playback:step`, `playback:speed-change` |
| **Render**   | `render:message-added`, `render:complete`           |
| **UI**       | `ui:theme-change`, `ui:scroll-request`              |

### Affected Files

- New: `src/events/event-bus.ts`
- New: `src/events/event-map.ts` (typed event definitions)
- `src/main.ts` (instantiate and inject EventBus)
- `src/components/playback-controller.ts` (emit events instead of direct calls)
- `src/components/chat-renderer.ts` (subscribe to events instead of receiving direct method calls)
- `src/components/file-upload.ts` (emit file:loaded event)
- `src/components/progress-bar.ts` (subscribe to playback events)

## Acceptance Criteria

- [ ] `EventBus` class is implemented with `emit`, `on`, `off`, and `once` methods
- [ ] An `EventMap` interface defines all event names and their payload types
- [ ] Publishing an event with the wrong payload type is a compile-time error
- [ ] Subscribing to an event provides correctly-typed payload in the handler callback
- [ ] Components communicate through the EventBus rather than holding direct references to each other
- [ ] Direct DOM custom events for inter-component communication are removed
- [ ] The EventBus has no DOM dependency and can be instantiated in a pure Node/test environment
- [ ] Memory leaks are prevented: handlers can be removed, and a `destroy()` method clears all listeners
- [ ] Unit tests verify event delivery, type safety, and listener removal

## Dependencies

- None (foundational infrastructure, but should be wired before components are refactored to use it)

## Design Principles Applied

- **Dependency Inversion Principle**: Components depend on the `EventBus` abstraction and typed event contracts rather than on concrete sibling components. A `PlaybackController` emits `playback:step` without knowing whether a `ChatRenderer`, `ProgressBar`, or `ScrollManager` is listening.
- **DIP (continued)**: The event map acts as a shared contract; publishers and subscribers are decoupled through this interface rather than through direct method calls.
- **SRP**: Each component focuses on its own domain. Cross-cutting communication is delegated to the EventBus rather than being embedded in component logic.
