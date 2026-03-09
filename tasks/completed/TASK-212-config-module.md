# TASK-212: Extract Magic Numbers and Constants into Config Module

| Field       | Value                                      |
|-------------|-------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| Low                                        |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Audit the entire `src/` directory for magic numbers, hardcoded string literals, and inline configuration values. Extract them into a centralized configuration module at `src/config.ts` organized by domain.

Examples of values to extract:

- **Playback**: Default speed (ms per step), min/max speed, speed increment steps
- **Animation**: Typing speed (characters per frame), fade-in duration, reveal delay
- **Scroll**: Auto-scroll threshold (pixels from bottom), smooth scroll duration
- **UI**: Maximum visible messages, truncation length for long tool outputs, debounce intervals
- **Parser**: Maximum file size, maximum line count, supported JSONL schema versions
- **File Upload**: Accepted MIME types, maximum file size in bytes

The config module should export a frozen (read-only) configuration object with typed, well-named keys. Components import specific config values rather than defining their own inline constants.

### Affected Files

- New: `src/config.ts`
- All component and utility files that currently contain magic numbers or hardcoded values

## Acceptance Criteria

- [ ] A `src/config.ts` module exports a typed, readonly configuration object
- [ ] All magic numbers in component files are replaced with named config imports
- [ ] All hardcoded string literals used as configuration (MIME types, CSS class names used as config, etc.) are centralized
- [ ] Configuration values are organized by domain (playback, animation, scroll, ui, parser, upload)
- [ ] The config object is deeply frozen (`as const` or `Object.freeze`) to prevent runtime mutation
- [ ] Each config value has a descriptive name that explains its purpose
- [ ] No behavioral changes result from the extraction (values remain identical)
- [ ] A grep for common magic number patterns (bare numbers in comparisons, string literals in conditionals) returns no results in component files

## Dependencies

- None (can be done at any time, but benefits from being done before other refactors so new code uses config from the start)

## Design Principles Applied

- **DRY (Don't Repeat Yourself)**: A single source of truth for every tunable value. Changing playback speed range means editing one line in `config.ts` rather than hunting through multiple files.
- **SRP**: Configuration management is its own concern, separated from the business logic that consumes the values.
