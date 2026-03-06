# TASK-214: Add Tick Rendering Strategy Pattern for Progress Bar

| Field       | Value                                      |
|-------------|-------------------------------------------|
| **Status**  | TODO                                       |
| **Priority**| Low                                        |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Refactor the `ProgressBar` component (`src/components/progress-bar.ts`) to use the Strategy pattern for tick rendering, enabling different visualization modes without modifying the core progress bar logic.

Currently, the progress bar likely has a single hardcoded approach to rendering tick marks that represent conversation messages. By introducing a `TickRenderStrategy` interface, the progress bar can support multiple visualization modes:

### Visualization Strategies

| Strategy           | Description                                                        |
|-------------------|--------------------------------------------------------------------|
| **Default Ticks** | Current behavior: uniform tick marks for each message               |
| **Role-Colored**  | Ticks are color-coded by message role (user = blue, assistant = green, tool = orange) |
| **Density Heat**  | Tick width or opacity reflects message length/complexity            |
| **Minimap**       | Ticks rendered as a minimap-style overview of the conversation      |

### Strategy Interface

The `TickRenderStrategy` interface defines:

- `renderTick(index, message, container)` - Render a single tick element
- `updateTick(index, state)` - Update tick appearance (e.g., mark as "played" vs "upcoming")
- `getTickStyles()` - Return CSS custom properties or class names for the strategy

The `ProgressBar` component receives a strategy via constructor injection and delegates all tick rendering to it. Changing visualization mode means swapping the strategy, not modifying `ProgressBar` internals.

### Affected Files

- `src/components/progress-bar.ts` (accept and delegate to strategy)
- New: `src/components/strategies/tick-render-strategy.ts` (interface)
- New: `src/components/strategies/default-tick-strategy.ts` (current behavior)
- New: `src/components/strategies/role-colored-tick-strategy.ts` (enhanced visualization)

## Acceptance Criteria

- [ ] `TickRenderStrategy` interface is defined with `renderTick`, `updateTick`, and `getTickStyles` methods
- [ ] `DefaultTickStrategy` reproduces the current tick rendering behavior exactly
- [ ] At least one alternative strategy (e.g., `RoleColoredTickStrategy`) is implemented as a proof of concept
- [ ] `ProgressBar` delegates all tick rendering to the injected strategy
- [ ] The strategy is injected via constructor, not hardcoded
- [ ] Switching strategies at runtime is supported (e.g., via a UI toggle in future)
- [ ] The progress bar's core logic (position tracking, click-to-seek, drag) is unaffected by strategy choice
- [ ] No rendering regressions with the default strategy

## Dependencies

- **TASK-212**: Magic numbers for tick sizing/spacing should come from the config module

## Design Principles Applied

- **Dependency Inversion Principle**: `ProgressBar` depends on the `TickRenderStrategy` abstraction, not on concrete rendering logic. New visualization modes are added by implementing the interface, not by modifying the progress bar.
- **DIP (continued)**: High-level progress tracking logic is decoupled from low-level rendering details. The strategy decides *how* ticks look; the progress bar decides *where* and *when* they appear.
- **SRP**: Tick visual rendering is separated from progress tracking, seek handling, and position calculation.
