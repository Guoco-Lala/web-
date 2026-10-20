(() => {
  const todoInput = document.querySelector('#todo-input');
  const addTodoButton = document.querySelector('#add-todo-button');
  const todoList = document.querySelector('#todo-list');
  const todoMessage = document.querySelector('#todo-message');
  const todoFilters = document.querySelector('#todo-filters');

  if (!todoInput || !addTodoButton || !todoList || !todoMessage || !todoFilters) {
    console.error('Todo 初始化失败：缺少必需的页面元素。');
    return;
  }

  const STORAGE_KEY = 'todo-v2-todos';
  let todos = load();
  let currentFilter = 'all';
  let message = '';
  let isComposing = false;

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Todo 保存失败：', error);
      message = '保存 Todo 时发生错误，请检查浏览器存储设置。';
    }
  }

  function load() {
    try {
      const savedTodos = localStorage.getItem(STORAGE_KEY);
      if (!savedTodos) return [];

      const parsedTodos = JSON.parse(savedTodos);
      if (!Array.isArray(parsedTodos)) return [];
      return parsedTodos.filter((todo) => (
        todo && typeof todo.id === 'string' &&
        typeof todo.text === 'string' &&
        typeof todo.completed === 'boolean'
      ));
    } catch (error) {
      console.error('Todo 读取失败：', error);
      return [];
    }
  }

  function render() {
    const focusedButton = document.activeElement?.closest?.('#todo-list [data-action]');
    const focusedTodo = focusedButton
      ? {
        id: focusedButton.dataset.id,
        action: focusedButton.dataset.action,
        index: Array.from(todoList.children).indexOf(focusedButton.closest('li'))
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
      item.dataset.id = todo.id;
      if (todo.completed) item.classList.add('is-completed');

      const toggleButton = document.createElement('button');
      toggleButton.className = 'todo-toggle';
      toggleButton.type = 'button';
      toggleButton.dataset.action = 'toggle';
      toggleButton.dataset.id = todo.id;
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
      editButton.textContent = '编辑';
      editButton.setAttribute('aria-label', `编辑：${todo.text}`);

      const removeButton = document.createElement('button');
      removeButton.className = 'todo-remove';
      removeButton.type = 'button';
      removeButton.dataset.action = 'delete';
      removeButton.textContent = '删除';
      removeButton.setAttribute('aria-label', `删除：${todo.text}`);

      item.append(toggleButton, text, editButton, removeButton);
      fragment.appendChild(item);
    });
    todoList.appendChild(fragment);

    if (focusedTodo) {
      const actionButtons = Array.from(todoList.querySelectorAll('[data-action]'))
        .filter((button) => button.dataset.action === focusedTodo.action);
      const sameTodoButton = actionButtons.find((button) => button.dataset.id === focusedTodo.id);
      const fallbackButton = actionButtons[Math.min(focusedTodo.index, actionButtons.length - 1)];
      const fallbackFilter = todoFilters.querySelector(`[data-filter="${currentFilter}"]`);
      (sameTodoButton || fallbackButton || fallbackFilter)?.focus();
    }

    todoFilters.querySelectorAll('[data-filter]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === currentFilter));
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

  function addTodo(text) {
    const todoText = text.trim();
    const normalizedTodoText = todoText.toLocaleLowerCase('zh-CN');

    if (!todoText) {
      message = '请输入 Todo 内容后再添加。';
      render();
      todoInput.focus();
      return false;
    }

    if (todos.some((todo) => todo.text.toLocaleLowerCase('zh-CN') === normalizedTodoText)) {
      message = '该 Todo 已在列表中，请勿重复添加。';
      render();
      todoInput.focus();
      return false;
    }

    todos = [...todos, {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: todoText,
      completed: false
    }];
    save();
    render();
    return true;
  }

  function deleteTodo(id) {
    console.log('[delete]', id);
    todos = todos.filter((todo) => todo.id !== id);
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((todo) => !todo.completed);
    save();
    render();
  }

  function toggleTodo(id) {
    console.log('[toggle]', id);
    todos = todos.map((todo) => (
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
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
    const filterButton = event.target.closest('[data-filter]');
    if (!filterButton) return;
    currentFilter = filterButton.dataset.filter;
    render();
  });

  todoList.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const item = event.target.closest('li');
    if (!item || !todoList.contains(item)) return;

    const id = item.dataset.id;
    if (!id) return;

    const deleteButton = event.target.closest('[data-action="delete"]');
    if (deleteButton && item.contains(deleteButton)) {
      deleteTodo(id);
    } else {
      const editButton = event.target.closest('[data-action="edit"]');
      if (editButton && item.contains(editButton)) {
        const todo = todos.find((candidate) => candidate.id === id);
        if (!todo) return;

        const nextText = window.prompt('修改任务', todo.text);
        if (nextText === null) return;

        const trimmedText = nextText.trim();
        if (!trimmedText) return;

        todos = todos.map((candidate) => (
          candidate.id === id
            ? { ...candidate, text: trimmedText }
            : candidate
        ));
        save();
        render();
      } else {
        toggleTodo(id);
      }
    }
  });

  render();
})();
