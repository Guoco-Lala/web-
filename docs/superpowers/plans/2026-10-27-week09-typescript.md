# Week09 TypeScript Implementation Plan

> **For agentic workers:** Execute the following checklist inline in this session.

**Goal:** Complete task 1 with numeric Todo IDs, validated DOM/storage boundaries and a runnable TypeScript page.

**Architecture:** src/todo.ts owns the typed immutable data operations; src/main.ts owns DOM rendering, events and persistence. Vite serves and builds the TypeScript entry point.

**Tech Stack:** TypeScript strict mode, Vite, existing Vitest.

## Global Constraints

- No any, non-null assertions or casts to suppress type errors.
- Preserve duplicate rejection, IME handling, editing, filtering, persistence and focus restoration.
- Do not generate the student's five independent task 2 tests.

### Task 1: Connect TypeScript to the existing page

- [x] Move script.js to src/main.ts and import addTodo, toggleTodo and Todo from ./todo.
- [x] Narrow DOM elements with instanceof and filter values with explicit literal checks.
- [x] Validate unknown JSON with an object/field type guard, retaining legacy UUID tasks through numeric ID migration.
- [x] Write numeric IDs to dataset with String(id); read with blank rejection, Number(raw), Number.isSafeInteger(id) and id > 0.
- [x] Add dev/build/preview scripts using Vite, change index.html to /src/main.ts and ignore node_modules/dist.

### Task 2: Verify and report

- [x] Run npm run typecheck, npm run test and npm run build; all must pass.
- [x] Exercise immutable data operations and boundary conversion with temporary checks, clearly separate from the student's task 2 work.
- [x] Report checks actually run and provide truthful AI/student collaboration wording.

## Verification results

- npm run typecheck: passed.
- npm run test: the existing single smoke test passed; task 2 tests remain independent student work.
- npm run build: passed.
- Headless Chrome: addition, numeric dataset IDs, missing/blank/malformed/fractional/negative/unsafe IDs, toggle, focus, filter, edit, delete, persistence, and legacy UUID migration passed without page errors.
