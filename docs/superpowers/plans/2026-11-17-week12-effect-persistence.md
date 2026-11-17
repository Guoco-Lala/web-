# Week12 useEffect Persistence Plan

**Goal:** Save Todo state through one Effect after safely loading the initial state.

**Architecture:** Keep the existing module-level loadTodos and its validators, ID migration, and storage key. TodoApp passes loadTodos to useState, then one Effect writes the complete todos array on initialization and updates. Event handlers only change React state.

**Tech Stack:** React, TypeScript, Vite, Vitest, localStorage.

## Constraints

- Work on `feat/week12-effect-persistence`, based on the completed task 1 commit.
- Preserve theme switching, StrictMode, existing Todo behavior, and `todo-v2-todos` data.
- Handle storage access, invalid JSON, non-array data and failed writes.
- Do not introduce a read Effect or keep manual save calls in handlers.
- Do not modify the original Word log or include unrelated untracked files.

## Steps

- [x] Inspect the working tree and create the task branch before modifying code.
- [x] In `src/components/TodoApp.tsx`, import useEffect; replace persist with one write Effect using `[todos]`; remove the four persist calls.
- [x] Verify lazy initialization and existing safety/migration logic remain intact.
- [x] Run build, 28 existing tests and format checks; all pass. Review the diff before committing.
- [x] Verify in Chrome at http://127.0.0.1:5173/ with StrictMode enabled: add then refresh, complete then refresh, edit then refresh, delete then refresh. All results persist.
- [x] Use Application / Local storage to test `not-json` and a non-array JSON object. Both recover to an empty list; the write Effect stores `[]`. Restore a valid test task and refresh successfully.
- [x] Prepare `week12/任务二useEffect持久化操作步骤与协作记录.md` with actual code, screenshot instructions and truthful verification wording.
- [x] Review the diff and commit only task 2 files locally; unrelated untracked files remain excluded.

## Verification notes

- The browser initially had an empty task list for the tested origin. Only the created test task and its test storage were modified.
- The final browser page contains `W12 持久化测试` and the matching `todo-v2-todos` value for the student's screenshot.
- The 28 existing tests exercise the data helpers; browser checks separately establish the observed persistence behavior.
- No read Effect, theme persistence, changes to the storage key, or dependency updates were introduced.
