import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { inputDoc } from '../src/content/components/Fields/Input/InputDoc.tsx';
import { textareaDoc } from '../src/content/components/Fields/TextArea/TextAreaDoc.tsx';

afterEach(cleanup);

it.each([
  ['Input', inputDoc, 6],
  ['TextArea', textareaDoc, 3],
] as const)('pairs each %s example with its complete portable source', (_name, doc, count) => {
  expect(doc.examples).toHaveLength(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Fields', doc.title, `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('filters documents and restores them with clear while returning focus', async () => {
  const user = userEvent.setup();
  render(inputDoc.examples![1].demo);
  const input = screen.getByRole('textbox', { name: 'Поиск' });
  await user.type(input, 'токены');
  expect(screen.getByRole('status').textContent).toBe('Найдено документов: 1');
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  await user.clear(input);
  await user.type(input, 'missing');
  expect(screen.getByText('Ничего не найдено')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Очистить поиск' }));
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(input).toHaveProperty('value', '');
  expect(document.activeElement).toBe(input);
});

it('limits the name input and clears both its text and character count', async () => {
  const user = userEvent.setup();
  render(inputDoc.examples![2].demo);
  const input = screen.getByRole('textbox', { name: 'Название' });
  await user.click(screen.getByRole('button', { name: 'Очистить название' }));
  await user.type(input, 'x'.repeat(31));
  expect(input).toHaveProperty('value', 'x'.repeat(30));
  expect(screen.getByText('30 / 30')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Очистить название' }));
  expect(input).toHaveProperty('value', '');
  expect(screen.getByText('0 / 30')).toBeTruthy();
});

it('saves only email values that pass native validation', async () => {
  const user = userEvent.setup();
  render(inputDoc.examples![3].demo);
  const input = screen.getByRole('textbox', { name: 'Электронная почта' }) as HTMLInputElement;
  await user.type(input, 'not-an-email');
  expect(input.checkValidity()).toBe(false);
  await user.click(screen.getByRole('button', { name: 'Сохранить почту' }));
  expect(screen.queryByRole('status')).toBeNull();
  await user.clear(input);
  await user.type(input, 'anna@example.com');
  await user.click(screen.getByRole('button', { name: 'Сохранить почту' }));
  expect(screen.getByRole('status').textContent).toBe('Сохранённая почта: anna@example.com');
});

it('preserves the password when toggling visibility twice', async () => {
  const user = userEvent.setup();
  render(inputDoc.examples![4].demo);
  const input = screen.getByLabelText('Пароль') as HTMLInputElement;
  await user.type(input, 'demo-password');
  await user.click(screen.getByRole('button', { name: 'Показать пароль' }));
  expect(input.type).toBe('text');
  expect(input.value).toBe('demo-password');
  await user.click(screen.getByRole('button', { name: 'Скрыть пароль' }));
  expect(input.type).toBe('password');
  expect(input.value).toBe('demo-password');
});

it('reports stepped quantities, respects the maximum and preserves empty input', async () => {
  const user = userEvent.setup();
  render(inputDoc.examples![5].demo);
  const input = screen.getByRole('spinbutton', { name: 'Количество' });
  const increase = screen.getByRole('button', { name: 'Увеличить значение' });
  for (let index = 0; index < 9; index++) await user.click(increase);
  expect(screen.getByRole('status').textContent).toBe('Количество: 10');
  await user.click(increase);
  expect(screen.getByRole('status').textContent).toBe('Количество: 10');
  await user.clear(input);
  expect(screen.getByRole('status').textContent).toBe('Количество не задано');
});

it('accepts multiline notes and clears them while restoring focus', async () => {
  const user = userEvent.setup();
  render(textareaDoc.examples![0].demo);
  const input = screen.getByRole('textbox', { name: 'Заметки' });
  await user.type(input, 'Первая строка{Enter}Вторая строка');
  expect(input).toHaveProperty('value', 'Первая строка\nВторая строка');
  expect(input.hasAttribute('data-auto-size')).toBe(true);
  expect(screen.getByText('27 / 200')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Очистить заметки' }));
  expect(input).toHaveProperty('value', '');
  expect(screen.getByText('0 / 200')).toBeTruthy();
  expect(document.activeElement).toBe(input);
});
