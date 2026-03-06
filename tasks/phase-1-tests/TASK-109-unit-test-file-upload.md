# TASK-109: Unit Tests for FileUpload Component

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | Medium       |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the `FileUpload` component in `src/components/file-upload.ts`. This component handles file drag-and-drop and file input change events, reads the file contents via the FileReader API, and passes the result to a callback. Tests should mock DOM events and FileReader.

## Acceptance Criteria

- [ ] Test that a `dragover` event adds the appropriate hover CSS class to the drop zone
- [ ] Test that a `dragleave` event removes the hover CSS class
- [ ] Test that a `drop` event reads the dropped file and invokes the onLoad callback with file contents
- [ ] Test that a file input `change` event reads the selected file and invokes the onLoad callback
- [ ] Test that dropping a non-JSONL file shows an error or is rejected
- [ ] Test that dropping multiple files only processes the first (or handles appropriately)
- [ ] Test FileReader `onload` callback correctly passes the text result
- [ ] Test FileReader `onerror` callback handles read failures gracefully
- [ ] Test that the component cleans up event listeners on destroy/detach
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/components/file-upload.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid (with DOM environment configured)
- `src/components/file-upload.ts` module must exist
