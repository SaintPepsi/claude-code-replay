# TASK-209: Extract Keyboard Shortcuts into KeyboardHandler

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| Medium                                     |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Extract keyboard shortcut handling from wherever it currently lives (likely `PlaybackController` or `main.ts`) into a dedicated `KeyboardHandler` class that uses the Command pattern.

Each keyboard shortcut maps to a named command object with `execute()` and optional `canExecute()` methods. The `KeyboardHandler` maintains a registry of key bindings to commands, enabling:

- Centralized shortcut management (no scattered `addEventListener('keydown', ...)` calls)
- Easy addition/removal of shortcuts
- Context-aware shortcuts (some keys only active during playback, others always available)
- Discoverability (the handler can list all registered shortcuts for a help overlay)
- Testability (commands can be unit tested without simulating key events)

### Affected Files

- New: `src/components/keyboard-handler.ts`
- `src/components/playback-controller.ts` (remove keyboard listeners)
- `src/main.ts` (register keyboard handler and wire commands)

## Acceptance Criteria

- [ ] `KeyboardHandler` class manages all keyboard event listeners
- [ ] Commands are registered as objects implementing a `Command` interface (`execute`, `canExecute`)
- [ ] Key bindings are configurable (mapping from key combo to command name)
- [ ] Context-aware activation (e.g., spacebar for play/pause only when not typing in an input)
- [ ] Modifier key combinations are supported (Ctrl+, Shift+, Alt+)
- [ ] A method lists all registered shortcuts (for potential help overlay)
- [ ] No keyboard event handling remains in `PlaybackController` or other components
- [ ] All existing keyboard shortcuts continue to function
- [ ] Commands can be executed programmatically (not only via key press)

## Dependencies

- **TASK-207**: Playback state machine should be defined so commands can query state for `canExecute`

## Design Principles Applied

- **Single Responsibility Principle**: Keyboard input handling is isolated from the business logic it triggers. The handler translates physical keys into logical commands.
- **Dependency Inversion Principle**: The handler depends on the `Command` interface, not on concrete component methods. Components provide commands; the handler invokes them without knowing what they do.
