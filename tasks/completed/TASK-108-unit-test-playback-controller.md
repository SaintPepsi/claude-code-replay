# TASK-108: Unit Tests for PlaybackController Component

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | High         |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the `PlaybackController` component in `src/components/playback-controller.ts`. This component manages playback logic including play, pause, step forward, seek to position, speed adjustment, and realtime mode. Tests should verify state transitions and callback invocations using Vitest's fake timers where appropriate.

## Acceptance Criteria

- [ ] Test `play` starts playback and advances through messages over time
- [ ] Test `pause` stops playback and preserves current position
- [ ] Test `step` advances exactly one message and remains paused
- [ ] Test `seek` jumps to a specific message index
- [ ] Test `seek` clamps to valid bounds (0 to message count - 1)
- [ ] Test speed adjustment changes the interval between message advances
- [ ] Test all supported speed values (e.g., 1x, 2x, 4x, 8x)
- [ ] Test realtime mode uses actual message timestamps for pacing
- [ ] Test that playback stops automatically when the last message is reached
- [ ] Test play/pause toggle behavior (calling play while playing, pause while paused)
- [ ] Test that callbacks (onStep, onComplete, onStateChange) are invoked correctly
- [ ] Test reset returns controller to initial state
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/components/playback-controller.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid
- `src/components/playback-controller.ts` module must exist
- `src/types.ts` type definitions must exist
