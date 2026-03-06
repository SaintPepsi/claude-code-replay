# TASK-208: Extract Animation Engine from PlaybackController

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | TODO                                       |
| **Priority**| Medium                                     |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Extract the typing/reveal animation logic from `PlaybackController` into a dedicated `AnimationEngine` class. Currently, the playback controller mixes timing/sequencing concerns with visual animation concerns (character-by-character text reveal, fade-in effects, smooth content appearance).

The `AnimationEngine` should:

- Accept an animation target (DOM element or content string) and animation parameters (speed, style)
- Manage `requestAnimationFrame` loops or interval-based character reveal
- Expose a promise-based or callback API so the playback controller knows when an animation completes
- Support cancellation (when the user seeks or skips ahead)
- Be injectable into the playback controller, allowing alternative animation strategies (instant reveal for accessibility, reduced motion preferences)

### Affected Files

- New: `src/components/animation-engine.ts`
- `src/components/playback-controller.ts` (remove animation logic, inject AnimationEngine)

## Acceptance Criteria

- [ ] `AnimationEngine` class encapsulates all typing/reveal animation logic
- [ ] Animation speed is configurable and can change mid-animation
- [ ] Animations are cancellable (immediate completion on skip/seek)
- [ ] The engine respects `prefers-reduced-motion` media query
- [ ] `PlaybackController` delegates to `AnimationEngine` rather than managing animation directly
- [ ] `AnimationEngine` is injected into `PlaybackController` via constructor
- [ ] Promise-based or callback API signals animation completion to the caller
- [ ] No animation-related code remains in `PlaybackController`
- [ ] Visual animation behavior is identical to current implementation

## Dependencies

- **TASK-207**: Playback state machine should be in place so animation start/stop aligns with state transitions

## Design Principles Applied

- **Single Responsibility Principle**: Animation rendering is separated from playback sequencing. The playback controller decides *what* to show next; the animation engine decides *how* to reveal it.
- **Dependency Inversion Principle**: `PlaybackController` depends on an injectable `AnimationEngine` abstraction, not hardcoded animation logic. This allows swapping animation strategies (typing, fade, instant) without modifying the controller.
