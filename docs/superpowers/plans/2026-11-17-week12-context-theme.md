# Week12 Context Theme Implementation Plan

**Goal:** Add light/dark theme switching to the existing React Todo app on `feat/week12-context-theme`.

**Architecture:** A ThemeProvider above TodoApp owns theme and setTheme. TodoApp and TodoItem each consume the shared value through useTheme, which calls useContext. Scoped CSS variables and a task-item theme class change the visible appearance.

**Tech Stack:** React, TypeScript, Vite, Vitest, CSS.

## Constraints

- Keep the project in week07/project and preserve existing uncommitted files.
- Limit this change to task 1; keep existing Todo validation, storage, editing and filtering.
- Retain StrictMode. Do not persist the theme or change dependency versions.
- Keep the existing light layout, add readable dark colors and retain focus indicators.

## Tasks

- [x] Create the feature branch before editing project files; run baseline build and tests.
- [x] Add `src/context/ThemeContext.tsx`: Theme union, typed Context, ThemeProvider with theme/setTheme, guarded useTheme.
- [x] Wrap TodoApp with ThemeProvider in `src/main.tsx`.
- [x] Consume useTheme in `src/components/TodoApp.tsx`; set page data-theme and add a toggle using the previous theme.
- [x] Consume useTheme in `src/components/TodoItem.tsx`; add a theme class while retaining completed styling and all action handlers.
- [x] Update `style.css` with page/panel/input/message/item colors for both themes and a wrapping header.
- [x] Run build, existing tests and formatting checks; all pass, including 28 existing tests. The existing lint script exits successfully but its overrides only target .ts, so this does not establish TSX lint coverage.
- [ ] Verify light → dark → light, Todo actions, and small-screen layout in the browser. Browser access is unavailable to the agent; manual steps are supplied in the student guide.
- [x] Review the diff and save report text and screenshot instructions under week12. Commit only this task's files.

## Acceptance checks

1. A task is visible in both themes; page, input and task colors update together.
2. Changing theme preserves task text, completion, filters and an in-progress input.
3. Add, complete, filter and delete work after switching theme; refreshing retains tasks using the existing storage code.
4. No Context consumer is outside ThemeProvider; TypeScript build and all 28 existing tests pass.
5. The report identifies AI work accurately and labels personal verification text for use after the student performs it.
