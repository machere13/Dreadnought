import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { DatePicker } from '../../../../../../src/adapters/react/components/Fields/DatePicker/DatePicker.tsx';

afterEach(cleanup);

it('focuses and selects a date beyond a multi-year disabled interval', async () => {
  const user = userEvent.setup();
  render(
    <DatePicker
      aria-label="Date"
      defaultValue="2026-10-12"
      maxDate="2030-01-01"
      disabledDate={(date) => date > '2026-10-12' && date < '2028-10-12'}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  await user.keyboard('{ArrowRight}');
  await waitFor(() => expect(document.activeElement?.getAttribute('data-date')).toBe('2028-10-12'));
  await user.keyboard('{Enter}');
  expect(screen.getByRole('textbox', { name: 'Date' })).toHaveProperty('value', '2028-10-12');
});

it('preserves custom root slot styling', () => {
  render(<DatePicker aria-label="Date" slotClassNames={{ root: 'custom-picker' }} />);
  expect(screen.getByRole('textbox').closest('.custom-picker')).not.toBeNull();
});

it('renders library fields, buttons and calendar icon', () => {
  render(<DatePicker aria-label="Date" defaultValue="2026-10-12" />);
  expect(screen.getByRole('textbox', { name: 'Date' })).toHaveProperty('value', '2026-10-12');
  const button = screen.getByRole('button', { name: 'Open calendar' });
  expect(button.querySelector('svg')).not.toBeNull();
  expect(button.getAttribute('data-ui')).toBe('button');
  expect(screen.getByRole('textbox').closest('[data-ui="input"]')).not.toBeNull();
});

it('uses Select and Input in the calendar header and can select a day', async () => {
  const user = userEvent.setup();
  render(<DatePicker aria-label="Date" defaultValue="2026-10-12" />);
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  expect(
    screen.getByRole('combobox', { name: 'Month' }).closest('[data-ui="select"]'),
  ).not.toBeNull();
  expect(
    screen.getByRole('spinbutton', { name: 'Year' }).closest('[data-ui="input"]'),
  ).not.toBeNull();
  await user.keyboard('{ArrowRight}{Enter}');
  expect(screen.getByRole('textbox', { name: 'Date' })).toHaveProperty('value', '2026-10-13');
});

it('clears the full range using an icon-only action', async () => {
  const user = userEvent.setup();
  render(
    <DatePicker mode="range" aria-label="Period" defaultValue={['2026-10-10', '2026-10-20']} />,
  );
  const clear = screen.getByRole('button', { name: 'Clear date' });
  expect(clear.querySelector('svg')).not.toBeNull();
  await user.click(clear);
  expect(screen.getByRole('textbox', { name: 'Period start' })).toHaveProperty('value', '');
  expect(screen.getByRole('textbox', { name: 'Period end' })).toHaveProperty('value', '');
});
