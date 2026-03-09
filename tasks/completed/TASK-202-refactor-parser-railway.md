# TASK-202: Refactor parseJSONL to Use Result Type

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| High                                       |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Refactor the JSONL parser (`src/parser/jsonl-parser.ts`) to use the `Result<T, E>` type from TASK-201 instead of throwing exceptions or returning nullable values. The parsing pipeline should be decomposed into discrete, single-responsibility stages:

1. **Line splitting** - Split raw text into individual lines
2. **Validation** - Validate each line is well-formed JSON
3. **Transformation** - Transform parsed JSON into domain types
4. **Aggregation** - Collect validated results, accumulating errors separately from successes

Each stage should be a pure function that returns a `Result`, enabling clean composition via `map`/`andThen`. Validation logic (checking required fields, correct shapes) must be separated from transformation logic (converting raw JSON into typed conversation entries).

### Affected Files

- `src/parser/jsonl-parser.ts`
- `src/parser/tool-summary.ts` (may need Result-aware signatures)

## Acceptance Criteria

- [ ] `parseJSONL` returns `Result<ParsedConversation, ParseError>` instead of throwing
- [ ] Validation is a separate pure function from transformation
- [ ] Individual line parse errors are accumulated rather than aborting the entire parse
- [ ] A `ParseError` type is defined with structured error information (line number, raw content, reason)
- [ ] Callers use `match` or `map` to handle results instead of try/catch
- [ ] Tool summary generation receives already-validated data (no redundant re-validation)
- [ ] Existing functionality is preserved with no behavioral regressions
- [ ] Partial parse results are available even when some lines fail (graceful degradation)

## Dependencies

- **TASK-201**: Requires the `Result<T, E>` type and its utility functions

## Design Principles Applied

- **Railway-Oriented Programming**: Each parsing stage returns a Result, and stages compose via `andThen`/`map`. Errors propagate along the error rail without explicit checking at every step.
- **Single Responsibility Principle**: Validation and transformation are separate functions with distinct concerns. Line splitting, JSON parsing, schema validation, and domain mapping are each isolated.
