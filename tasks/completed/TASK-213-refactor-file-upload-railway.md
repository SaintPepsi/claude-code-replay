# TASK-213: Add Validation Pipeline for File Upload with Result Type

| Field       | Value                                      |
|-------------|-------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| Medium                                     |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Refactor the file upload flow in `src/components/file-upload.ts` to use a railway-oriented validation pipeline built on the `Result<T, E>` type from TASK-201. Currently, file validation (type checking, size checking, content reading, JSONL parsing) is likely handled with imperative if/else chains and try/catch blocks.

Replace this with a composable pipeline of validation steps:

### Validation Pipeline Stages

1. **File Presence** - Verify a file was actually selected (not a cancelled dialog)
2. **MIME Type Check** - Validate the file type matches accepted formats (`.jsonl`, `.json`, `text/plain`)
3. **Size Check** - Ensure the file does not exceed the maximum allowed size
4. **Read File** - Read the file contents via `FileReader` (async, may fail)
5. **Content Validation** - Verify the content is non-empty and contains valid JSONL structure
6. **Parse** - Delegate to the JSONL parser (TASK-202) and propagate its `Result`

Each stage returns a `Result<StageOutput, UploadError>` and the pipeline chains via `andThen`. Errors at any stage short-circuit with a user-friendly error message and error code.

### Error Handling

Define an `UploadError` type with structured fields:

- `code`: Machine-readable error code (e.g., `INVALID_TYPE`, `FILE_TOO_LARGE`, `PARSE_FAILED`)
- `message`: Human-readable description for display in the UI
- `details`: Optional additional context (file name, size, expected vs. actual type)

### Affected Files

- `src/components/file-upload.ts` (refactor validation flow)
- May introduce `src/types/upload-error.ts` or extend `src/types.ts`

## Acceptance Criteria

- [ ] File validation uses a pipeline of `Result`-returning functions composed via `andThen`
- [ ] An `UploadError` type is defined with `code`, `message`, and optional `details`
- [ ] Each validation stage is a separate, testable function
- [ ] Error messages are user-friendly and specific to the failure (not generic "upload failed")
- [ ] The pipeline short-circuits on the first failure (no unnecessary processing)
- [ ] Successful validation produces a parsed conversation ready for playback
- [ ] Drag-and-drop upload uses the same validation pipeline as the file input dialog
- [ ] UI error display shows the error message from the `UploadError`
- [ ] All existing upload scenarios (valid file, wrong type, too large, malformed JSONL) work correctly

## Dependencies

- **TASK-201**: Requires the `Result<T, E>` type
- **TASK-202**: The parse stage delegates to the refactored JSONL parser

## Design Principles Applied

- **Railway-Oriented Programming**: The validation pipeline is a chain of `Result`-returning functions. Each stage either passes the validated value forward or diverts to the error rail with a specific `UploadError`. No try/catch, no nested if/else.
- **SRP**: Each validation concern (type check, size check, content read, parse) is an isolated function that can be tested and reasoned about independently.
- **DRY**: The same pipeline serves both the file input dialog and drag-and-drop upload paths, eliminating duplicated validation logic.
