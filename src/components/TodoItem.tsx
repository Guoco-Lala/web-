import type { Todo } from '../todo';

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete
}: TodoItemProps) {
  return (
    <li className={`todo-item${todo.completed ? ' is-completed' : ''}`}>
      <button
        className="todo-toggle"
        type="button"
        aria-pressed={todo.completed}
        aria-label={`${todo.completed ? '取消完成' : '标记完成'}：${todo.text}`}
        onClick={() => onToggle(todo.id)}
      >
        {todo.completed ? '取消完成' : '标记完成'}
      </button>
      <span className="todo-text">{todo.text}</span>
      <button
        className="todo-edit"
        type="button"
        aria-label={`编辑：${todo.text}`}
        onClick={() => onEdit(todo.id)}
      >
        编辑
      </button>
      <button
        className="todo-remove"
        type="button"
        aria-label={`删除：${todo.text}`}
        onClick={() => onDelete(todo.id)}
      >
        删除
      </button>
    </li>
  );
}
