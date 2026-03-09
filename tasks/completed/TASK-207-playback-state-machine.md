# TASK-207: Refactor PlaybackController into Explicit State Machine

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| High                                       |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Refactor `PlaybackController` to use an explicit finite state machine with well-defined states and transitions, replacing the current approach of managing playback state through ad-hoc boolean flags and conditional checks.

### States

| State     | Description                                       |
|-----------|---------------------------------------------------|
| **Idle**  | No conversation loaded, awaiting file upload       |
| **Playing** | Actively advancing through messages on a timer  |
| **Paused**  | Playback halted, can resume or seek             |
| **Seeking** | User is dragging/clicking to navigate to a position |

### Transitions

- `Idle -> Playing` (conversation loaded and play triggered)
- `Playing -> Paused` (user pauses or playback reaches end)
- `Playing -> Seeking` (user initiates seek during playback)
- `Paused -> Playing` (user resumes)
- `Paused -> Seeking` (user seeks while paused)
- `Seeking -> Playing` (seek completes, resume playback)
- `Seeking -> Paused` (seek completes, stay paused)
- `* -> Idle` (new file uploaded / reset)

Invalid transitions should be no-ops or log warnings. Each state defines which actions are permitted, eliminating impossible state combinations.

### Affected Files

- `src/components/playback-controller.ts`

## Acceptance Criteria

- [ ] Playback states are defined as a discriminated union or enum
- [ ] State transitions are explicit and validated (invalid transitions are rejected)
- [ ] Boolean flag combinations (`isPlaying && !isPaused && !isSeeking`) are eliminated
- [ ] Each state clearly defines which UI controls are enabled/disabled
- [ ] Timer management (start/stop intervals) is tied to state transitions, not scattered logic
- [ ] Speed changes are handled within the Playing state without state transition bugs
- [ ] All existing playback functionality (play, pause, step, seek, speed change) works correctly
- [ ] Impossible states are unrepresentable in the type system

## Dependencies

- None (can be done independently, but coordinates well with TASK-208 and TASK-209)

## Design Principles Applied

- **Single Responsibility Principle**: The state machine handles state transitions only. Side effects (animation, rendering, scroll) are triggered by transition hooks, not embedded in transition logic.
