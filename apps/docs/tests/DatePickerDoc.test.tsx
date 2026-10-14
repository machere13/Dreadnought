import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { datePickerDoc } from '../src/content/components/Fields/DatePickerDoc.tsx';
import { DatePickerDemo } from '../src/content/components/Fields/DatePickerDemo.tsx';
import { DatePickerFormDemo } from '../src/content/components/Fields/DatePickerFormDemo.tsx';
import { DatePickerRangeDemo } from '../src/content/components/Fields/DatePickerRangeDemo.tsx';

afterEach(cleanup);

it('pairs each date example with its complete portable source', () => {
  expect(datePickerDoc.examples).toHaveLength(3);
  for (const example of datePickerDoc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Fields', `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('reports accepted date changes and clearing', async () => {
  const user = userEvent.setup();
  render(<DatePickerDemo />);
  const input = screen.getByRole('textbox', { name: 'Дата' });
  fireEvent.change(input, { target: { value: '2026-10-20' } });
  input.focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status').textContent).toContain('2026-10-20');
  await user.click(screen.getByRole('button', { name: 'Clear date' }));
  expect(screen.getByRole('status').textContent).toContain('не выбрана');
});

it('publishes only a complete allowed range after clearing', async () => {
  const user = userEvent.setup();
  render(<DatePickerRangeDemo />);
  await user.click(screen.getByRole('button', { name: /Clear/ }));
  const [start, end] = screen.getAllByRole('textbox');
  start.focus();
  fireEvent.change(start, { target: { value: '2026-10-11' } });
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status').textContent).toContain('не выбран');
  end.focus();
  fireEvent.change(end, { target: { value: '2027-01-01' } });
  await user.keyboard('{Enter}');
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('не выбран');
  fireEvent.change(end, { target: { value: '2026-10-21' } });
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status').textContent).toContain('2026-10-11 — 2026-10-21');
});

it('does not submit the previously saved date when the Form draft is invalid', async () => {
  const user = userEvent.setup();
  render(<DatePickerFormDemo />);
  const input = screen.getByRole('textbox', { name: 'Дата встречи' });
  fireEvent.change(input, { target: { value: '2026-02-30' } });
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.getByRole('alert').textContent).toContain('YYYY-MM-DD');
  fireEvent.change(input, { target: { value: '2026-10-20' } });
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(screen.getByRole('status').textContent).toBe('2026-10-20');
});

it('supports calendar keyboard selection in the documentation', async () => {
  const user = userEvent.setup();
  render(<DatePickerDemo />);
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  await user.keyboard('{ArrowRight}{Enter}');
  expect(screen.getByRole('textbox', { name: 'Дата' })).toHaveProperty('value', '2026-10-13');
});

it('submits and resets the controlled Form date', async () => {
  const user = userEvent.setup();
  render(<DatePickerFormDemo />);
  const field = screen.getByRole('textbox', { name: 'Дата встречи' });
  await user.clear(field);
  await user.type(field, '2026-10-20{Enter}');
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(screen.getByRole('status').textContent).toBe('2026-10-20');
  await user.click(screen.getByRole('button', { name: 'Сбросить' }));
  expect(field).toHaveProperty('value', '2026-10-12');
});
