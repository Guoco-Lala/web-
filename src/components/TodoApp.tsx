import { useState } from 'react';
import { addTodo, deleteTodo, toggleTodo, type Todo } from '../todo';
import TodoForm from './TodoForm';
import TodoList from './TodoList';

type Filter = 'all' | 'active' | 'completed';
const STORAGE_KEY = 'todo-v2-todos';

interface StoredTodoShape {
  id: unknown;
  text: string;
  completed: boolean;
}

function hasTodoFields(value: unknown): value is StoredTodoShape {
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

function loadTodos(): Todo[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    const values: unknown[] = parsed;
    const usedIds = new Set<number>();
    values.forEach((value) => {
      if (
        hasTodoFields(value) &&
        typeof value.id === 'number' &&
        Number.isSafeInteger(value.id) &&
        value.id > 0
      ) {
        usedIds.add(value.id);
      }
    });

    const loadedIds = new Set<number>();
    let nextId = 1;
    const todos: Todo[] = [];
    values.forEach((value) => {
      if (!hasTodoFields(value)) return;
      let id: number;
      if (
        typeof value.id === 'number' &&
        Number.isSafeInteger(value.id) &&
        value.id > 0
      ) {
        id = value.id;
      } else if (typeof value.id === 'string' && value.id.trim() !== '') {
        while (usedIds.has(nextId)) nextId += 1;
        id = nextId;
        usedIds.add(id);
        nextId += 1;
      } else {
        return;
      }
      if (loadedIds.has(id)) return;
      loadedIds.add(id);
      todos.push({ id, text: value.text, completed: value.completed });
    });
    return todos;
  } catch (error) {
    console.error('Todo 读取失败：', error);
    return [];
  }
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [message, setMessage] = useState('');

  function persist(nextTodos: Todo[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTodos));
    } catch (error) {
      console.error('Todo 保存失败：', error);
      setMessage('保存 Todo 时发生错误，请检查浏览器存储设置。');
    }
  }

  function handleAdd(): boolean {
    const normalizedText = text.trim();
    if (!normalizedText) {
      setMessage('请输入 Todo 内容后再添加。');
      return false;
    }
    if (
      todos.some(
        (todo) =>
          todo.text.toLocaleLowerCase('zh-CN') ===
          normalizedText.toLocaleLowerCase('zh-CN')
      )
    ) {
      setMessage('该 Todo 已在列表中，请勿重复添加。');
      return false;
    }

    const nextId = todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
    if (!Number.isSafeInteger(nextId)) {
      setMessage('任务 ID 已超出安全整数范围，无法添加。');
      return false;
    }
    const nextTodos = addTodo(todos, normalizedText, nextId);
    setTodos(nextTodos);
    persist(nextTodos);
    setMessage('');
    return true;
  }

  function handleToggle(id: number) {
    const nextTodos = toggleTodo(todos, id);
    setTodos(nextTodos);
    persist(nextTodos);
    setMessage('');
  }

  function handleDelete(id: number) {
    const nextTodos = deleteTodo(todos, id);
    setTodos(nextTodos);
    persist(nextTodos);
    setMessage('');
  }

  function handleEdit(id: number) {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return;
    const editedText = window.prompt('修改任务', todo.text);
    if (editedText === null || editedText.trim() === '') return;
    const nextText = editedText.trim();
    const nextTodos = todos.map((item) =>
      item.id === id ? { ...item, text: nextText } : item
    );
    setTodos(nextTodos);
    persist(nextTodos);
    setMessage('');
  }

  const visibleTodos = todos.filter((todo) => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  const statusMessage =
    message ||
    (todos.length === 0
      ? '列表为空，请添加第一条 Todo。'
      : visibleTodos.length === 0
        ? '当前筛选下没有 Todo。'
        : `共 ${todos.length} 条 Todo，当前显示 ${visibleTodos.length} 条。`);

  return (
    <main className="todo-page">
      <section className="todo-panel" aria-labelledby="page-title">
        <h1 id="page-title">Todo 列表</h1>
        <p>记录需要完成的事项。</p>

        <TodoForm text={text} onTextChange={setText} onAdd={handleAdd} />

        <div className="todo-toolbar">
          <p className="todo-message" role="status" aria-live="polite">
            {statusMessage}
          </p>
          <div className="todo-filters" role="group" aria-label="筛选任务">
            {(['all', 'active', 'completed'] as const).map((value) => {
              const labels: Record<Filter, string> = {
                all: '全部',
                active: '未完成',
                completed: '已完成'
              };
              return (
                <button
                  key={value}
                  className="filter-button"
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {labels[value]}
                </button>
              );
            })}
          </div>
        </div>

        <TodoList
          todos={visibleTodos}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </main>
  );
}
