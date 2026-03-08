# TASK-103: Unit Tests for Markdown-to-HTML Converter

| Field    | Value        |
|----------|--------------|
| Status   | TODO         |
| Priority | High         |
| Assignee | Unassigned   |

## Description

Write failing unit tests for the markdown-to-HTML converter in `src/utils/markdown.ts`. This module converts a subset of Markdown syntax into safe HTML for rendering chat messages. Tests must cover all supported Markdown features: code blocks, inline code, bold, italic, headers, links, tables, blockquotes, and lists.

## Acceptance Criteria

- [ ] Test fenced code blocks (``` delimited) produce `<pre><code>` output
- [ ] Test fenced code blocks with language identifiers
- [ ] Test inline code (backtick-wrapped) produces `<code>` output
- [ ] Test bold (`**text**`) produces `<strong>` output
- [ ] Test italic (`*text*` or `_text_`) produces `<em>` output
- [ ] Test headers (`#` through `######`) produce correct `<h1>`-`<h6>` tags
- [ ] Test links (`[text](url)`) produce `<a>` tags with correct href
- [ ] Test tables with header row and alignment
- [ ] Test blockquotes (`>`) produce `<blockquote>` output
- [ ] Test unordered lists (`-` or `*`) produce `<ul><li>` output
- [ ] Test ordered lists (`1.`) produce `<ol><li>` output
- [ ] Test nested formatting (e.g., bold inside a list item)
- [ ] Test that HTML special characters inside Markdown are escaped
- [ ] Test empty input returns empty or minimal output
- [ ] All tests are written in Vitest and initially fail (red phase of TDD)
- [ ] Test file is located at `tests/unit/utils/markdown.test.ts`

## Dependencies

- `vitest.config.ts` must be present and valid
- `src/utils/markdown.ts` module must exist
