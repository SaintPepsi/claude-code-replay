# TASK-211: Refactor Markdown Converter into Composable Pipeline

| Field       | Value                                      |
|-------------|-------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| Medium                                     |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Refactor the markdown conversion logic in `src/utils/markdown.ts` from a monolithic function into a composable pipeline of discrete transform steps, each with a single responsibility. The pipeline uses the `Result<T, E>` type from TASK-201 so that malformed input or transform failures propagate cleanly without try/catch blocks.

### Pipeline Stages

1. **Sanitize** - Escape or strip dangerous HTML using `escHtml.ts` (existing utility)
2. **Redact** - Apply redaction rules from `redact.ts` (existing utility)
3. **Parse Blocks** - Identify fenced code blocks, inline code, and prose regions
4. **Transform Inline** - Convert inline markdown syntax (bold, italic, links, inline code) to HTML
5. **Transform Blocks** - Convert block-level syntax (headers, lists, code fences, blockquotes) to HTML
6. **Highlight** - Apply syntax highlighting to code blocks (if applicable)
7. **Assemble** - Join transformed segments into final HTML output

Each stage is a pure function with the signature `(input: StageResult) => Result<StageResult, TransformError>`. Stages compose via `andThen` / `flatMap`, forming a railway where any stage failure short-circuits the rest of the pipeline with a descriptive error.

### Affected Files

- `src/utils/markdown.ts` (decompose into pipeline)
- `src/utils/escHtml.ts` (may wrap return in Result)
- `src/utils/redact.ts` (may wrap return in Result)

## Acceptance Criteria

- [ ] Each transform stage is an isolated, pure function with a clear input/output contract
- [ ] Stages compose via `Result.andThen` / `flatMap` into a single pipeline function
- [ ] The pipeline is defined declaratively (array or chain of stages), making it easy to add, remove, or reorder steps
- [ ] A `TransformError` type captures which stage failed and why
- [ ] Malformed markdown input produces a `Result.err` rather than throwing
- [ ] Code block detection correctly avoids transforming markdown syntax inside fenced blocks
- [ ] The final HTML output is identical to the current implementation for all valid inputs
- [ ] Individual stages can be unit tested in isolation
- [ ] The pipeline function is the single public export; internal stages are implementation details

## Dependencies

- **TASK-201**: Requires the `Result<T, E>` type for railway composition

## Design Principles Applied

- **Railway-Oriented Programming**: Each pipeline stage returns a `Result`. Success flows forward; errors short-circuit with context about which stage failed. No try/catch blocks needed.
- **Single Responsibility Principle**: Each stage has exactly one job (sanitize, parse blocks, transform inline, etc.). Adding a new transform (e.g., emoji support, LaTeX rendering) means adding one new stage function without touching others.
- **DRY**: Common patterns like "skip code blocks" are handled once in the block-parsing stage rather than being repeated in every transform.
