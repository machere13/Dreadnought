import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { treeSelectDoc } from '../src/content/components/Fields/TreeSelectDoc.tsx';
import { TreeSelectFormDemo } from '../src/content/components/Fields/TreeSelectFormDemo.tsx';
import { TreeSelectMultipleDemo } from '../src/content/components/Fields/TreeSelectMultipleDemo.tsx';
import { TreeSelectStrictDemo } from '../src/content/components/Fields/TreeSelectStrictDemo.tsx';
import { TreeSelectDemo } from '../src/content/components/Fields/TreeSelectDemo.tsx';
import { TreeSelectSearchDemo } from '../src/content/components/Fields/TreeSelectSearchDemo.tsx';
import { TreeSelectUnknownDemo } from '../src/content/components/Fields/TreeSelectUnknownDemo.tsx';
import { TreeSelectStatesDemo } from '../src/content/components/Fields/TreeSelectStatesDemo.tsx';

afterEach(cleanup);

it('pairs every tree selection scenario with its complete portable source', () => {
  expect(treeSelectDoc.examples).toHaveLength(7);
  for (const example of treeSelectDoc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Fields', `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('shows a selected team and clears both the field and result', async () => {
  const user = userEvent.setup();
  render(<TreeSelectDemo />);
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.click(screen.getByRole('treeitem', { name: 'Frontend', exact: true }));
  expect(screen.getByRole('status').textContent).toBe('Команда: Frontend (front)');
  expect(screen.getByRole('combobox', { name: 'Команда' })).toHaveProperty('value', 'Frontend');
  await user.click(screen.getByRole('button', { name: 'Очистить выбор' }));
  expect(screen.getByRole('status').textContent).toBe('Команда не выбрана');
});

it('keeps search text separate from a selected key even when results are empty', async () => {
  const user = userEvent.setup();
  render(<TreeSelectSearchDemo />);
  const field = screen.getByRole('combobox', { name: 'Поиск команды' });
  await user.type(field, 'front');
  expect(screen.getByRole('status').textContent).toContain('нет');
  expect(screen.getByRole('treeitem', { name: 'Frontend', exact: true })).toBeTruthy();
  expect(screen.queryByRole('treeitem', { name: 'Backend', exact: true })).toBeNull();
  await user.click(screen.getByRole('treeitem', { name: 'Frontend', exact: true }));
  await user.click(field);
  await user.clear(field);
  await user.type(field, 'missing');
  expect(screen.getByText('Команды не найдены')).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('front');
});

it('preserves an unknown saved key until replacement or explicit clearing', async () => {
  const user = userEvent.setup();
  render(<TreeSelectUnknownDemo />);
  expect(screen.getByRole('combobox')).toHaveProperty('value', 'archived');
  expect(screen.getByRole('status').textContent).toContain('archived');
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.click(screen.getByRole('treeitem', { name: 'Дизайн', exact: true }));
  expect(screen.getByRole('status').textContent).toContain('design');
  await user.click(screen.getByRole('button', { name: 'Очистить выбор' }));
  expect(screen.getByRole('status').textContent).toContain('нет');
});

it('distinguishes a disabled field, read-only value and disabled nodes', async () => {
  const user = userEvent.setup();
  render(<TreeSelectStatesDemo />);
  const disabled = screen.getByRole('combobox', { name: 'Недоступный выбор' });
  const readOnly = screen.getByRole('combobox', { name: 'Только просмотр' });
  expect(disabled).toHaveProperty('disabled', true);
  expect(readOnly).toHaveProperty('readOnly', true);
  expect(readOnly).toHaveProperty('value', 'Frontend');
  await user.click(screen.getByRole('combobox', { name: 'Нет доступных команд' }));
  await user.click(screen.getByRole('treeitem', { name: 'Frontend', exact: true }));
  expect(screen.getByRole('combobox', { name: 'Нет доступных команд' })).toHaveProperty(
    'value',
    '',
  );
});

it('requires a selection rather than search text and resets accepted Form values', async () => {
  const user = userEvent.setup();
  render(<TreeSelectFormDemo />);
  const field = screen.getByRole('combobox', { name: 'Команда' });
  await user.type(field, 'front');
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.getByText('Выберите команду')).not.toBeNull();
  expect(field.closest('[data-ui="tree-select"]')?.getAttribute('data-invalid')).toBe('true');
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.click(screen.getByRole('treeitem', { name: 'Frontend', exact: true }));
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(screen.getByRole('status').textContent).toContain('front');
  await user.type(field, 'missing');
  await user.click(screen.getByRole('button', { name: 'Сбросить' }));
  expect(field).toHaveProperty('value', '');
  expect(screen.queryByRole('status')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  expect(screen.getByRole('treeitem', { name: 'Backend', exact: true })).not.toBeNull();
});

it('checks the full branch during search in linked mode', async () => {
  const user = userEvent.setup();
  render(<TreeSelectMultipleDemo />);
  await user.type(screen.getByRole('combobox'), 'front');
  await user.click(screen.getByRole('checkbox', { name: 'Разработка' }));
  expect(screen.getByRole('status').textContent).toContain('["dev","front","back"]');
  expect(screen.getByRole('button', { name: 'Удалить Разработка' })).not.toBeNull();
  await user.click(screen.getByRole('button', { name: 'Удалить Разработка' }));
  expect(screen.getByRole('status').textContent).toContain('[]');
});

it('keeps parent selection independent in strict mode', async () => {
  const user = userEvent.setup();
  render(<TreeSelectStrictDemo />);
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.click(screen.getByRole('checkbox', { name: 'Разработка' }));
  expect(screen.getByRole('status').textContent).toContain('["dev"]');
  expect(screen.getByRole('checkbox', { name: 'Frontend' })).toHaveProperty('checked', false);
  expect(screen.getByRole('checkbox', { name: 'Backend' })).toHaveProperty('checked', false);
});
