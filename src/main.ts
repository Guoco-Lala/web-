import {
  addTodo as addTodoData,
  toggleTodo as toggleTodoData,
  type Todo
} from './todo';

type Filter = 'all' | 'active' | 'completed';

function isFilter(value: string | undefined): value is Filter {
  return value === 'all' || value === 'active' || value === 'completed';
}

function hasTodoFields(
  value: unknown
): value is { id: unknown; text: string; completed: boolean } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'text' in value &&
    typeof value.text === 'string' &&
    'completed' in value &&
    typeof value.completed === 'boolean'
  );
}

interface LegacyIdState {
  usedIds: Set<number>;
  nextId: number;
}

function getStoredTodoId(
  value: { id: unknown },
  state: LegacyIdState
): number | undefined {
  if (
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    value.id > 0
  ) {
    return value.id;
  }
  if (typeof value.id !== 'string' || value.id.trim() === '') return undefined;

  while (state.usedIds.has(state.nextId)) state.nextId += 1;
  const id = state.nextId;
  state.usedIds.add(id);
  state.nextId += 1;
  return id;
}

function migrateStoredTodos(values: unknown[]): Todo[] {
  const usedIds = new Set<number>();
  for (const value of values) {
    if (
      hasTodoFields(value) &&
      typeof value.id === 'number' &&
      Number.isSafeInteger(value.id) &&
      value.id > 0
    ) {
      usedIds.add(value.id);
    }
  }

  const state: LegacyIdState = { usedIds, nextId: 1 };
  const loadedIds = new Set<number>();
  const result: Todo[] = [];
  for (const value of values) {
    if (!hasTodoFields(value)) continue;
    const id = getStoredTodoId(value, state);
    if (id === undefined || loadedIds.has(id)) continue;
    loadedIds.add(id);
    result.push({ id, text: value.text, completed: value.completed });
  }
  return result;
}

function getTodoId(element: Element): number | undefined {
  const rawId = element.closest('li')?.dataset.id;
  if (rawId === undefined || rawId.trim() === '') return undefined;
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

function editTodo(id: number, todos: Todo[]): Todo[] {
  const todo = todos.find((candidate) => candidate.id === id);
  if (!todo) return todos;

  const nextText = window.prompt('修改任务', todo.text);
  if (nextText === null) return todos;
  const trimmedText = nextText.trim();
  if (!trimmedText) return todos;

  return todos.map((candidate) =>
    candidate.id === id ? { ...candidate, text: trimmedText } : candidate
  );
}

(() => {
  const todoInputElement = document.querySelector('#todo-input');
  const addTodoButtonElement = document.querySelector('#add-todo-button');
  const todoListElement = document.querySelector('#todo-list');
  const todoMessageElement = document.querySelector('#todo-message');
  const todoFiltersElement = document.querySelector('#todo-filters');

  if (
    !(todoInputElement instanceof HTMLInputElement) ||
    !(addTodoButtonElement instanceof HTMLButtonElement) ||
    !(todoListElement instanceof HTMLUListElement) ||
    !(todoMessageElement instanceof HTMLElement) ||
    !(todoFiltersElement instanceof HTMLElement)
  ) {
    console.error('Todo 初始化失败：缺少必需的页面元素。');
    return;
  }

  const todoInput = todoInputElement;
  const addTodoButton = addTodoButtonElement;
  const todoList = todoListElement;
  const todoMessage = todoMessageElement;
  const todoFilters = todoFiltersElement;

  const STORAGE_KEY = 'todo-v2-todos';
  let todos = load();
  let currentFilter: Filter = 'all';
  let message = '';
  let isComposing = false;

  function save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Todo 保存失败：', error);
      message = '保存 Todo 时发生错误，请检查浏览器存储设置。';
    }
  }

  function load(): Todo[] {
    try {
      const savedTodos = localStorage.getItem(STORAGE_KEY);
      if (!savedTodos) return [];

      const parsedTodos: unknown = JSON.parse(savedTodos);
      if (!Array.isArray(parsedTodos)) return [];
      const values: unknown[] = parsedTodos;
      return migrateStoredTodos(values);
    } catch (error) {
      console.error('Todo 读取失败：', error);
      return [];
    }
  }

  function render(): void {
    const focusedButton = document.activeElement?.closest<HTMLButtonElement>(
      '#todo-list button[data-action]'
    );
    const focusedTodo = focusedButton
      ? {
          id: focusedButton.dataset.id,
          action: focusedButton.dataset.action,
          index: Array.from(todoList.children).findIndex(
            (item) => item === focusedButton.closest('li')
          )
        }
      : null;

    todoList.replaceChildren();

    const visibleTodos = todos.filter((todo) => {
      if (currentFilter === 'completed') return todo.completed;
      if (currentFilter === 'active') return !todo.completed;
      return true;
    });

    const fragment = document.createDocumentFragment();
    visibleTodos.forEach((todo) => {
      const item = document.createElement('li');
      item.className = 'todo-item';
      item.dataset.id = String(todo.id);
      if (todo.completed) item.classList.add('is-completed');

      const toggleButton = document.createElement('button');
      toggleButton.className = 'todo-toggle';
      toggleButton.type = 'button';
      toggleButton.dataset.action = 'toggle';
      toggleButton.dataset.id = String(todo.id);
      toggleButton.setAttribute('aria-pressed', String(todo.completed));
      const toggleAction = todo.completed ? '取消完成' : '标记完成';
      toggleButton.setAttribute('aria-label', `${toggleAction}：${todo.text}`);
      toggleButton.textContent = toggleAction;

      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = todo.text;

      const editButton = document.createElement('button');
      editButton.className = 'todo-edit';
      editButton.type = 'button';
      editButton.dataset.action = 'edit';
      editButton.dataset.id = String(todo.id);
      editButton.textContent = '编辑';
      editButton.setAttribute('aria-label', `编辑：${todo.text}`);

      const removeButton = document.createElement('button');
      removeButton.className = 'todo-remove';
      removeButton.type = 'button';
      removeButton.dataset.action = 'delete';
      removeButton.dataset.id = String(todo.id);
      removeButton.textContent = '删除';
      removeButton.setAttribute('aria-label', `删除：${todo.text}`);

      item.append(toggleButton, text, editButton, removeButton);
      fragment.appendChild(item);
    });
    todoList.appendChild(fragment);

    if (focusedTodo) {
      const actionButtons = Array.from(
        todoList.querySelectorAll<HTMLButtonElement>('button[data-action]')
      ).filter((button) => button.dataset.action === focusedTodo.action);
      const sameTodoButton = actionButtons.find(
        (button) => button.dataset.id === focusedTodo.id
      );
      const fallbackButton =
        actionButtons[Math.min(focusedTodo.index, actionButtons.length - 1)];
      const fallbackFilter = todoFilters.querySelector<HTMLButtonElement>(
        `[data-filter="${currentFilter}"]`
      );
      (sameTodoButton || fallbackButton || fallbackFilter)?.focus();
    }

    todoFilters
      .querySelectorAll<HTMLButtonElement>('button[data-filter]')
      .forEach((button) => {
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.filter === currentFilter)
        );
      });

    if (message) {
      todoMessage.textContent = message;
      message = '';
    } else if (todos.length === 0) {
      todoMessage.textContent = '列表为空，请添加第一条 Todo。';
    } else if (visibleTodos.length === 0) {
      todoMessage.textContent = '当前筛选下没有 Todo。';
    } else {
      todoMessage.textContent = `共 ${todos.length} 条 Todo，当前显示 ${visibleTodos.length} 条。`;
    }
  }

  function addTodo(text: string | null): boolean {
    const todoText = text === null ? '' : text.trim();
    const normalizedTodoText = todoText.toLocaleLowerCase('zh-CN');

    if (!todoText) {
      message = '请输入 Todo 内容后再添加。';
      render();
      todoInput.focus();
      return false;
    }

    if (
      todos.some(
        (todo) => todo.text.toLocaleLowerCase('zh-CN') === normalizedTodoText
      )
    ) {
      message = '该 Todo 已在列表中，请勿重复添加。';
      render();
      todoInput.focus();
      return false;
    }

    const nextId = todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
    if (!Number.isSafeInteger(nextId)) {
      message = '任务 ID 已超出安全整数范围，无法添加。';
      render();
      return false;
    }
    todos = addTodoData(todos, todoText, nextId);
    save();
    render();
    return true;
  }

  function deleteTodo(id: number): void {
    console.log('[delete]', id);
    todos = todos.filter((todo) => todo.id !== id);
    save();
    render();
  }

  function toggleTodo(id: number): void {
    console.log('[toggle]', id);
    todos = toggleTodoData(todos, id);
    save();
    render();
  }

  addTodoButton.addEventListener('click', () => {
    if (addTodo(todoInput.value)) {
      todoInput.value = '';
      todoInput.focus();
    }
  });

  todoInput.addEventListener('compositionstart', () => {
    isComposing = true;
  });

  todoInput.addEventListener('compositionend', () => {
    isComposing = false;
  });

  todoInput.addEventListener('keydown', (event) => {
    // 229 covers IME confirmation when compositionend precedes keydown (e.g. Safari).
    if (isComposing || event.isComposing || event.keyCode === 229) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      addTodoButton.click();
    }
  });

  todoFilters.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const filterButton = event.target.closest<HTMLButtonElement>(
      'button[data-filter]'
    );
    if (!filterButton || !todoFilters.contains(filterButton)) return;
    const filter = filterButton.dataset.filter;
    if (!isFilter(filter)) return;
    currentFilter = filter;
    render();
  });

  todoList.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const item = event.target.closest('li');
    if (!item || !todoList.contains(item)) return;
    const id = getTodoId(item);
    if (id === undefined) return;

    const deleteButton = event.target.closest('[data-action="delete"]');
    if (deleteButton && item.contains(deleteButton)) {
      deleteTodo(id);
      return;
    }

    const editButton = event.target.closest('[data-action="edit"]');
    if (editButton && item.contains(editButton)) {
      const updatedTodos = editTodo(id, todos);
      if (updatedTodos !== todos) {
        todos = updatedTodos;
        save();
        render();
      }
      return;
    }

    toggleTodo(id);
  });

  render();
})();
