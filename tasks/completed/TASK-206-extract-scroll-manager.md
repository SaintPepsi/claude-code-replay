# TASK-206: Extract Scroll Management into ScrollManager

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| Low                                        |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Extract all scroll-related logic (auto-scroll during playback, scroll-to-message, scroll position preservation on re-render, scroll event listeners) from `ChatRenderer` and `PlaybackController` into a dedicated `ScrollManager` class.

The `ScrollManager` encapsulates:

- Auto-scroll behavior (scroll to bottom as new content appears during playback)
- User scroll intent detection (stop auto-scrolling when user scrolls up manually)
- Programmatic scroll-to-element navigation (e.g., clicking a progress bar tick to jump to a message)
- Smooth vs. instant scroll strategies

This removes scroll concerns from rendering and playback components, which should not need to know about scroll positioning.

### Affected Files

- New: `src/components/scroll-manager.ts`
- `src/components/chat-renderer.ts` (remove scroll logic)
- `src/components/playback-controller.ts` (remove scroll logic)

## Acceptance Criteria

- [ ] `ScrollManager` class owns all scroll-related state and behavior
- [ ] Auto-scroll during playback works as before (scrolls to latest content)
- [ ] Manual user scroll interrupts auto-scroll (user intent detection)
- [ ] Programmatic `scrollToMessage(index)` navigates to a specific message element
- [ ] Scroll behavior is configurable (smooth vs. instant)
- [ ] `ChatRenderer` no longer contains any scroll logic
- [ ] `PlaybackController` delegates scroll decisions to `ScrollManager`
- [ ] No visual or behavioral regressions in scroll behavior

## Dependencies

- None (can be done independently)

## Design Principles Applied

- **Single Responsibility Principle**: Scroll management is a distinct concern from rendering content or controlling playback timing. Extracting it makes each class focused on one job.
