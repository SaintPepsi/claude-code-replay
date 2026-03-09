# TASK-203: Extract DOM Creation Patterns into Reusable Element Factory

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| Medium                                     |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Audit the codebase for repeated DOM creation patterns (e.g., `document.createElement` followed by class assignment, attribute setting, and child appending) and extract them into a dedicated DOM helper module at `src/utils/dom.ts`.

The factory functions should provide a concise, declarative API for creating elements with attributes, classes, children, and event listeners in a single call. This eliminates the verbose imperative boilerplate scattered across renderer and component files while keeping the code framework-free (no virtual DOM, no JSX).

### Affected Files

- New: `src/utils/dom.ts`
- `src/components/chat-renderer.ts` (consume helpers)
- `src/components/task-manager.ts` (consume helpers)
- `src/components/playback-controller.ts` (consume helpers)
- `src/components/file-upload.ts` (consume helpers)
- `src/components/progress-bar.ts` (consume helpers)

## Acceptance Criteria

- [ ] A `createElement` (or `el`) factory function accepts tag name, attributes/classes, and children
- [ ] A `text` helper creates text nodes
- [ ] Convenience shortcuts exist for common elements (`div`, `span`, `button`, etc.)
- [ ] Event listeners can be attached declaratively through the factory options
- [ ] All existing inline DOM creation in components is replaced with factory calls
- [ ] No duplicate element creation patterns remain in component files
- [ ] No external DOM library dependencies are introduced
- [ ] The helper module has zero side effects on import

## Dependencies

- None (can be done independently, but should be completed before TASK-205)

## Design Principles Applied

- **DRY (Don't Repeat Yourself)**: Centralizes the repeated `createElement` + `classList.add` + `setAttribute` + `appendChild` pattern into a single reusable abstraction.
