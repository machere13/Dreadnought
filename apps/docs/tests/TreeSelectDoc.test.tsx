import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import {
  TreeSelectFormDemo,
  TreeSelectMultipleDemo,
} from '../src/content/components/Fields/TreeSelectDemo.tsx';

afterEach(cleanup);

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
  render(<TreeSelectMultipleDemo checkStrictly />);
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.click(screen.getByRole('checkbox', { name: 'Разработка' }));
  expect(screen.getByRole('status').textContent).toContain('["dev"]');
  expect(screen.getByRole('checkbox', { name: 'Frontend' })).toHaveProperty('checked', false);
  expect(screen.getByRole('checkbox', { name: 'Backend' })).toHaveProperty('checked', false);
});
