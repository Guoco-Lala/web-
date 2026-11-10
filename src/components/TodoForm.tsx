import { useRef, type CompositionEvent, type FormEvent } from 'react';

export interface TodoFormProps {
  text: string;
  onTextChange: (text: string) => void;
  onAdd: () => boolean;
}

export default function TodoForm({ text, onTextChange, onAdd }: TodoFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposing = useRef(false);

  function submitTodo() {
    if (onAdd()) onTextChange('');
    inputRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitTodo();
  }

  function handleCompositionStart() {
    isComposing.current = true;
  }

  function handleCompositionEnd(_event: CompositionEvent<HTMLInputElement>) {
    isComposing.current = false;
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label htmlFor="todo-input">待办事项</label>
      <div className="input-row">
        <input
          ref={inputRef}
          id="todo-input"
          type="text"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={(event) => {
            if (
              isComposing.current ||
              event.nativeEvent.isComposing ||
              event.keyCode === 229
            ) {
              return;
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              submitTodo();
            }
          }}
          placeholder="例如：完成 Web 编程实验"
          autoComplete="off"
        />
        <button type="submit">添加</button>
      </div>
    </form>
  );
}
