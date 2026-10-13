(() => {
  const todoInput = document.querySelector('#todo-input');
  const addTodoButton = document.querySelector('#add-todo-button');
  const todoList = document.querySelector('#todo-list');
  const todoMessage = document.querySelector('#todo-message');

  if (!todoInput || !addTodoButton || !todoList || !todoMessage) {
    console.error('Todo 初始化失败：缺少必需的页面元素。');
    return;
  }

  const addedTodos = new Set();

  function addTodo() {
    // Remove surrounding whitespace before deciding whether to create an item.
    const todoText = todoInput.value.trim();
    const normalizedTodoText = todoText.toLocaleLowerCase('zh-CN');

    if (!todoText) {
      todoMessage.textContent = '请输入 Todo 内容后再添加。';
      todoInput.focus();
      return;
    }

    if (addedTodos.has(normalizedTodoText)) {
      todoMessage.textContent = '该 Todo 已在列表中，请勿重复添加。';
      todoInput.focus();
      return;
    }

    try {
      const todoItem = document.createElement('li');
      todoItem.textContent = todoText;
      todoList.appendChild(todoItem);
      addedTodos.add(normalizedTodoText);
      todoInput.value = '';
      todoMessage.textContent = '已添加 Todo，可以继续输入下一条。';
      todoInput.focus();
    } catch (error) {
      console.error('Todo 添加失败：', error);
      todoMessage.textContent = '添加 Todo 时发生错误，请刷新页面后重试。';
    }
  }

  addTodoButton.addEventListener('click', addTodo);

  todoInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTodo();
    }
  });
})();
