import { test, expect } from 'vitest';
import { addTodo, toggleTodo, type Todo } from './todo';

// 每次调用均创建独立数据；冻结输入以捕获写入，再检查内容和对象引用。
function createFixture(
  todos: Todo[] = [
    { id: 1, text: '学习 TypeScript', completed: false },
    { id: 2, text: '编写测试', completed: true }
  ]
) {
  const snapshot = todos.map((todo) => ({ ...todo }));
  const originalTasks = [...todos];

  todos.forEach((todo) => Object.freeze(todo));
  Object.freeze(todos);

  return {
    todos,
    snapshot,
    expectUnchanged() {
      expect(todos).toStrictEqual(snapshot);
      todos.forEach((todo, index) => {
        expect(todo).toBe(originalTasks[index]);
        expect(todo).toStrictEqual(snapshot[index]);
      });
    }
  };
}

// 维度：正常路径、数据隔离与不可变性。
test('addTodo 使用传入 ID 和文本添加初始未完成的任务', () => {
  const fixture = createFixture();

  const result = addTodo(fixture.todos, '完成实验', 3);

  expect(result).not.toBe(fixture.todos);
  expect(result).toStrictEqual([
    ...fixture.snapshot,
    { id: 3, text: '完成实验', completed: false }
  ]);
  fixture.expectUnchanged();
});

// 维度：空值、数据隔离与不可变性；拒绝添加时不要求创建新数组。
test.each([null, ''])('addTodo 拒绝空值 %j 并保留原任务', (text) => {
  const fixture = createFixture();

  const result = addTodo(fixture.todos, text, 3);

  expect(result).toStrictEqual(fixture.snapshot);
  fixture.expectUnchanged();
});

// 维度：格式、数据隔离与不可变性。
test.each(['   ', '\t', '\n', ' \t\r\n '])(
  'addTodo 拒绝纯空白文本 %j',
  (text) => {
    const fixture = createFixture();

    const result = addTodo(fixture.todos, text, 3);

    expect(result).toStrictEqual(fixture.snapshot);
    fixture.expectUnchanged();
  }
);

// 维度：格式、数据隔离与不可变性；去除首尾空白，保留内部空白。
test('addTodo 去除有效文本的首尾空白', () => {
  const fixture = createFixture();

  const result = addTodo(fixture.todos, ' \t\n整理  笔记\t内容\r\n ', 3);

  expect(result).not.toBe(fixture.todos);
  expect(result).toStrictEqual([
    ...fixture.snapshot,
    { id: 3, text: '整理  笔记\t内容', completed: false }
  ]);
  fixture.expectUnchanged();
});

// 维度：格式（超长文本）、数据隔离与不可变性；数据层没有长度限制。
test('addTodo 完整保存超长文本', () => {
  const fixture = createFixture();
  const text = '超长任务'.repeat(25_000);

  const result = addTodo(fixture.todos, text, 3);

  expect(result).not.toBe(fixture.todos);
  expect(result).toStrictEqual([
    ...fixture.snapshot,
    { id: 3, text, completed: false }
  ]);
  fixture.expectUnchanged();
});

// 维度：重复、数据隔离与不可变性；重复检查属于页面层。
test('addTodo 连续添加相同文本且 ID 不同时两次均成功', () => {
  const initial = createFixture();

  const first = addTodo(initial.todos, '重复任务', 3);

  expect(first).not.toBe(initial.todos);
  expect(first).toStrictEqual([
    ...initial.snapshot,
    { id: 3, text: '重复任务', completed: false }
  ]);
  initial.expectUnchanged();

  const intermediate = createFixture(first);
  const second = addTodo(intermediate.todos, '重复任务', 4);

  expect(second).not.toBe(first);
  expect(second).toStrictEqual([
    ...initial.snapshot,
    { id: 3, text: '重复任务', completed: false },
    { id: 4, text: '重复任务', completed: false }
  ]);
  intermediate.expectUnchanged();
  initial.expectUnchanged();
});

// 维度：格式。特殊空白也应被拒绝，原任务保持不变。
test.each([
  '\u00A0',          // 不换行空格
  '\u3000',          // 全角空格
  '\uFEFF',          // BOM / 零宽不换行空格
  ' \u00A0\u3000\t\n'
])('addTodo 拒绝特殊空白文本 %j', (text) => {
  const fixture = createFixture();

  const result = addTodo(fixture.todos, text, 3);

  expect(result).toStrictEqual(fixture.snapshot);
  fixture.expectUnchanged();
});

// 维度：格式。去除首尾特殊空白，保留内部空白、中文和表情。
test('addTodo 正确保留含中文和表情的有效文本', () => {
  const fixture = createFixture();

  const result = addTodo(
    fixture.todos,
    '\u3000完成 Web 实验 📚\u3000',
    3
  );

  expect(result).not.toBe(fixture.todos);
  expect(result).toStrictEqual([
    ...fixture.snapshot,
    {
      id: 3,
      text: '完成 Web 实验 📚',
      completed: false
    }
  ]);
  fixture.expectUnchanged();
});

// 维度：安全、数据隔离与不可变性。
// 仅验证数据层按普通字符串保存标记，不验证 DOM 渲染或浏览器 XSS 防护。
test.each(['<b>任务</b>', '<script>alert("xss")</script>'])(
  'addTodo 原样保存含 HTML 或脚本标记的文本 %j',
  (text) => {
    const fixture = createFixture();

    const result = addTodo(fixture.todos, text, 3);

    expect(result).not.toBe(fixture.todos);
    expect(result).toStrictEqual([
      ...fixture.snapshot,
      { id: 3, text, completed: false }
    ]);
    fixture.expectUnchanged();
  }
);

// 维度：越界与不存在（空列表）、正常路径、数据隔离与不可变性。
test('addTodo 可以向空列表添加任务', () => {
  const fixture = createFixture([]);

  const result = addTodo(fixture.todos, '首个任务', 1);

  expect(result).not.toBe(fixture.todos);
  expect(result).toStrictEqual([
    { id: 1, text: '首个任务', completed: false }
  ]);
  fixture.expectUnchanged();
});

// 维度：空值、格式、越界与不存在（空列表）、数据隔离与不可变性。
test.each([null, '', ' \t\n '])(
  'addTodo 在空列表中同样拒绝无效文本 %j',
  (text) => {
    const fixture = createFixture([]);

    const result = addTodo(fixture.todos, text, 1);

    expect(result).toStrictEqual([]);
    fixture.expectUnchanged();
  }
);

// 维度：正常路径、状态（未完成到已完成）、数据隔离与不可变性。
test('toggleTodo 只将目标未完成任务切换为已完成', () => {
  const fixture = createFixture();

  const result = toggleTodo(fixture.todos, 1);

  expect(result).not.toBe(fixture.todos);
  expect(result).toStrictEqual([
    { id: 1, text: '学习 TypeScript', completed: true },
    { id: 2, text: '编写测试', completed: true }
  ]);
  expect(result[0]).not.toBe(fixture.todos[0]);
  fixture.expectUnchanged();
});

// 维度：正常路径、状态（已完成到未完成）、数据隔离与不可变性。
test('toggleTodo 只将目标已完成任务切换为未完成', () => {
  const fixture = createFixture();

  const result = toggleTodo(fixture.todos, 2);

  expect(result).not.toBe(fixture.todos);
  expect(result).toStrictEqual([
    { id: 1, text: '学习 TypeScript', completed: false },
    { id: 2, text: '编写测试', completed: false }
  ]);
  expect(result[1]).not.toBe(fixture.todos[1]);
  fixture.expectUnchanged();
});

// 维度：越界与不存在、数据隔离与不可变性；仍使用合法的正安全整数 ID。
test.each([3, Number.MAX_SAFE_INTEGER])(
  'toggleTodo 找不到 ID %s 时保留所有任务内容和状态',
  (id) => {
    const fixture = createFixture();

    const result = toggleTodo(fixture.todos, id);

    expect(result).toStrictEqual(fixture.snapshot);
    fixture.expectUnchanged();
  }
);

// 维度：越界与不存在（空列表）、数据隔离与不可变性。
test('toggleTodo 可以正常处理空列表', () => {
  const fixture = createFixture([]);

  const result = toggleTodo(fixture.todos, 1);

  expect(result).toStrictEqual([]);
  fixture.expectUnchanged();
});

// 维度：重复、状态、数据隔离与不可变性。
test('toggleTodo 连续切换同一任务两次后恢复原状态', () => {
  const initial = createFixture();

  const first = toggleTodo(initial.todos, 1);

  expect(first).not.toBe(initial.todos);
  expect(first).toStrictEqual([
    { id: 1, text: '学习 TypeScript', completed: true },
    { id: 2, text: '编写测试', completed: true }
  ]);
  initial.expectUnchanged();

  const intermediate = createFixture(first);
  const second = toggleTodo(intermediate.todos, 1);

  expect(second).not.toBe(first);
  expect(second).toStrictEqual(initial.snapshot);
  intermediate.expectUnchanged();
  initial.expectUnchanged();
});
