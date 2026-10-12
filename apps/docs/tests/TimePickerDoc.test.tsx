import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { TimePickerDemo, TimePickerFormDemo } from '../src/content/components/Fields/TimePickerDemo.tsx';

afterEach(cleanup);

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
