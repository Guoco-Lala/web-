# Week11 React Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the existing Todo page from manual DOM rendering to four React components while preserving current add, edit, toggle, delete, filter, persistence, and validation behavior.

**Architecture:** Keep pure Todo data operations in `src/todo.ts` so the existing Vitest suite remains useful. Mount a React `TodoApp` from `src/main.tsx`; `TodoApp` owns state and persistence, while `TodoForm`, `TodoList`, and `TodoItem` receive data and callbacks through typed props. Keep the existing page shell and CSS selectors so visual behavior remains stable.

**Tech Stack:** React, React DOM, TypeScript, Vite, Vitest.

## Global Constraints

- Use `useState` for React state and immutable array/object updates.
- Pass data down through props and actions up through callbacks.
- Keep `strict: true` and make `npm run build` pass.
- Preserve the existing empty-input, duplicate-input, edit, filter, localStorage, and accessibility behavior.
- Do not use `innerHTML` or manual DOM mutation for Todo rendering.

### Task 1: Add React dependencies and mount point

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `index.html`
- Create: `src/main.tsx`
- Delete: `src/main.ts`

- [ ] Add `react` and `react-dom` runtime dependencies and their TypeScript declarations.
- [ ] Enable `jsx: "react-jsx"` and include `.tsx` files in TypeScript.
- [ ] Replace the old script entry with `/src/main.tsx` and mount `TodoApp` into `#app`.
- [ ] Run `npm run build` to catch dependency and JSX configuration errors.

### Task 2: Preserve data operations and create typed components

**Files:**
- Modify: `src/todo.ts`
- Create: `src/components/TodoForm.tsx`
- Create: `src/components/TodoList.tsx`
- Create: `src/components/TodoItem.tsx`
- Create: `src/components/TodoApp.tsx`

- [ ] Add an immutable `deleteTodo` data helper and keep `addTodo`/`toggleTodo` pure.
- [ ] Define `TodoFormProps`, `TodoListProps`, and `TodoItemProps` with callback types.
- [ ] Render form submission, list mapping, item controls, filter controls, messages, and edit prompts with React JSX.
- [ ] Put all `todos`, input text, filter, and message state in `TodoApp`.
- [ ] Use functional `setState` updates where the next value depends on previous state.
- [ ] Preserve localStorage loading, migration, saving, duplicate detection, IME-safe submit, edit validation, and focus/accessibility labels.

### Task 3: Verify behavior and record evidence

**Files:**
- Modify: `src/todo.test.ts` only if a focused delete helper test is needed.

- [ ] Run `npm run test` and `npm run build` on the completed branch.
- [ ] Run `rg -n "document\\.querySelector|document\\.getElementById|innerHTML" src` and confirm only the React mount lookup remains.
- [ ] Start Vite, verify add, toggle, delete, edit, filters, empty input, and duplicate input in the browser.
- [ ] Capture the React page and successful build/test terminal evidence.
- [ ] Review `git diff`, commit the completed W11 implementation on the feature branch, and prepare log text with actual command results.
