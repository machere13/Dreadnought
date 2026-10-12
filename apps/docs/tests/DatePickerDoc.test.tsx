import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { DatePickerDemo, DatePickerFormDemo } from '../src/content/components/Fields/DatePickerDemo.tsx';

afterEach(cleanup);

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
