export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function addTodo(
  todos: Todo[],
  text: string | null,
  id: number
): Todo[] {
  if (text === null || text.trim() === '') return todos;

  return [
    ...todos,
    {
      id,
      text: text.trim(),
      completed: false
    }
  ];
}

export function toggleTodo(todos: Todo[], id: number): Todo[] {
  return todos.map((todo) =>
    todo.id === id
      ? { ...todo, completed: !todo.completed }
      : todo
  );
}