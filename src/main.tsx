import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TodoApp from './components/TodoApp';

const appElement = document.querySelector('#app');

if (!appElement) {
  throw new Error('Todo 初始化失败：找不到 #app 容器。');
}

createRoot(appElement).render(
  <StrictMode>
    <TodoApp />
  </StrictMode>
);
