# TASK-201: Extract Result<T, E> Type for Railway-Oriented Error Handling

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| High                                       |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Foundation / Infrastructure                |

## Description

Create a `Result<T, E>` discriminated union type that serves as the foundational building block for railway-oriented programming across the codebase. This type encapsulates either a success value (`Ok<T>`) or a failure value (`Err<E>`), eliminating the need for thrown exceptions and try/catch blocks as primary control flow.

The Result type should include utility functions for chaining operations (`map`, `flatMap`/`andThen`, `mapErr`), unwrapping (`unwrapOr`, `match`), and combining multiple results. This enables a functional pipeline style where errors propagate automatically without manual checking at each step.

This type will be consumed by the JSONL parser (TASK-202), file upload validation (TASK-213), and the markdown pipeline (TASK-211).

### Affected Files

- `src/types.ts` (extend with Result type and related utilities)

## Acceptance Criteria

- [ ] `Result<T, E>` discriminated union is defined with `Ok<T>` and `Err<E>` variants
- [ ] Helper constructors `ok(value)` and `err(error)` are exported
- [ ] `map` function transforms the success value while passing errors through
- [ ] `flatMap` / `andThen` function chains operations that themselves return Results
- [ ] `mapErr` function transforms the error value while passing successes through
- [ ] `unwrapOr` provides a default value fallback for error cases
- [ ] `match` function handles both Ok and Err branches exhaustively
- [ ] Type narrowing works correctly with TypeScript discriminated union checks
- [ ] No external dependencies are introduced
- [ ] Unit-level type tests confirm correct inference and narrowing behavior

## Dependencies

- None (this is a foundational task with no prerequisites)

## Design Principles Applied

- **Railway-Oriented Programming**: The Result type is the core abstraction enabling the railway pattern, where success flows along the "happy path" rail and errors flow along the "error" rail without interrupting the pipeline.
