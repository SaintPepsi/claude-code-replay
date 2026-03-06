# TASK-305: Run tsc --noEmit with Strict Mode

| Field       | Value        |
|-------------|--------------|
| **Status**  | TODO         |
| **Priority**| High         |
| **Assignee**| Unassigned   |
| **Phase**   | 3 - Verify All Tests Pass |

## Description

Run the TypeScript compiler in check-only mode (`tsc --noEmit`) with strict mode enabled to identify all type errors across the codebase. Fix every reported error to ensure full type safety. This catches issues that Vite's esbuild-based transpilation silently ignores, such as implicit `any` types, null safety violations, and incorrect type assertions.

## Acceptance Criteria

- [ ] `tsconfig.json` has `"strict": true` enabled (or all individual strict flags)
- [ ] `tsc --noEmit` is run against the full project
- [ ] All type errors are captured and documented
- [ ] Every type error is fixed in the source code
- [ ] No use of `// @ts-ignore` or `as any` to suppress errors (unless genuinely necessary with justification)
- [ ] `tsc --noEmit` exits with code 0 after all fixes
- [ ] Test files (`.test.ts`) also pass strict type checking
- [ ] Changes are committed with clear commit messages referencing this task

## Dependencies

- Phase 1 conversion tasks must be complete
- Phase 2 migration tasks must be complete
