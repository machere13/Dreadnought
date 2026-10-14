import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { timePickerDoc } from '../src/content/components/Fields/TimePickerDoc.tsx';
import { TimePickerDemo } from '../src/content/components/Fields/TimePickerDemo.tsx';
import { TimePickerFormDemo } from '../src/content/components/Fields/TimePickerFormDemo.tsx';
import { TimePickerLimitsDemo } from '../src/content/components/Fields/TimePickerLimitsDemo.tsx';
import { TimePickerSecondsDemo } from '../src/content/components/Fields/TimePickerSecondsDemo.tsx';

afterEach(cleanup);

it('pairs each time example with its complete portable source', () => {
  expect(timePickerDoc.examples).toHaveLength(4);
  for (const example of timePickerDoc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Fields', `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('reports canonical time after manual confirmation and clearing', async () => {
  const user = userEvent.setup();
  render(<TimePickerDemo />);
  const input = screen.getByRole('textbox', { name: 'Время' });
  input.focus();
  fireEvent.change(input, { target: { value: '10:07' } });
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status').textContent).toContain('10:07:00');
  await user.click(screen.getByRole('button', { name: 'Clear time' }));
  expect(screen.getByRole('status').textContent).toContain('не выбрано');
});

it('preserves seconds in the controlled example', async () => {
  const user = userEvent.setup();
  render(<TimePickerSecondsDemo />);
  const input = screen.getByRole('textbox', { name: 'Время запуска' });
  input.focus();
  fireEvent.change(input, { target: { value: '09:30:45' } });
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status').textContent).toContain('09:30:45');
});

it('rejects lunch and accepts off-step manual time within working hours', async () => {
  const user = userEvent.setup();
  render(<TimePickerLimitsDemo />);
  const input = screen.getByRole('textbox', { name: 'Рабочее время' });
  input.focus();
  fireEvent.change(input, { target: { value: '13:15' } });
  await user.keyboard('{Enter}');
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('09:30:00');
  fireEvent.change(input, { target: { value: '10:07' } });
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status').textContent).toContain('10:07:00');
  expect(screen.queryByRole('alert')).toBeNull();
});

it('blocks invalid drafts and submits corrected off-grid time', async () => {
  const user = userEvent.setup();
  render(<TimePickerFormDemo />);
  const field = screen.getByRole('textbox', { name: 'Время' });
  fireEvent.change(field, { target: { value: '25:00' } });
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.getByRole('alert')).not.toBeNull();
  fireEvent.change(field, { target: { value: '10:07' } });
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(screen.getByRole('status').textContent).toBe('10:07:00');
});

it('resets accepted values and invalid controlled drafts', async () => {
  const user = userEvent.setup();
  render(<TimePickerFormDemo />);
  const field = screen.getByRole('textbox', { name: 'Время' });
  fireEvent.change(field, { target: { value: '25:00' } });
  await user.click(screen.getByRole('button', { name: 'Сбросить' }));
  expect(field).toHaveProperty('value', '09:30');
  expect(screen.queryByRole('alert')).toBeNull();
  fireEvent.change(field, { target: { value: '10:07' } });
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  await user.click(screen.getByRole('button', { name: 'Сбросить' }));
  expect(field).toHaveProperty('value', '09:30');
  expect(screen.queryByRole('status')).toBeNull();
});

it('selects and confirms time with the keyboard', async () => {
  const user = userEvent.setup();
  render(<TimePickerDemo />);
  await user.click(screen.getByRole('button', { name: 'Open time picker' }));
  await user.keyboard('{ArrowDown}{Enter}');
  await user.click(screen.getByRole('button', { name: 'Confirm time' }));
  expect(screen.getByRole('textbox', { name: 'Время' })).toHaveProperty('value', '10:30');
});
