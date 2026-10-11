import { StrictMode, createRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { DatePickerAdapter } from '../../../src/unstyled.ts';
import { OverlayVisibilityContext } from '../../../src/shared/OverlayVisibilityContext.ts';

afterEach(cleanup);

it('opens with focused selected day and selects the next day by keyboard', async () => {
  const user = userEvent.setup();
  render(<DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" />);
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  expect(screen.getByRole('grid')).toBeTruthy();
  expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-12');
  await user.keyboard('{ArrowRight}{Enter}');
  expect(screen.getByRole('textbox', { name: 'Date' })).toHaveProperty('value', '2026-10-13');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open calendar' }));
});

it('cancels by Escape without trapping Tab or publishing a range start', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DatePickerAdapter
      mode="range"
      aria-label="Period"
      defaultValue={['2026-10-10', '2026-10-20']}
      onChange={change}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  await user.keyboard('{Enter}{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Period start' })).toHaveProperty(
    'value',
    '2026-10-10',
  );
});

it('types valid input and leaves invalid text with an accessible error', async () => {
  const user = userEvent.setup();
  render(
    <>
      <DatePickerAdapter aria-label="Date" />
      <button>Outside</button>
    </>,
  );
  const input = screen.getByRole('textbox', { name: 'Date' });
  await user.type(input, '2026-02-30');
  await user.click(screen.getByRole('button', { name: 'Outside' }));
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toContain(
    'YYYY-MM-DD',
  );
  await user.clear(input);
  await user.type(input, '2026-10-12{Enter}');
  expect(input.getAttribute('aria-invalid')).toBeNull();
  expect(input).toHaveProperty('value', '2026-10-12');
});

it('preserves outside focus and forwards prevented input handlers', async () => {
  const user = userEvent.setup();
  render(
    <>
      <DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" />
      <button>Outside</button>
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  const outside = screen.getByRole('button', { name: 'Outside' });
  await user.click(outside);
  expect(document.activeElement).toBe(outside);
  expect(screen.queryByRole('dialog')).toBeNull();
  cleanup();
  render(<DatePickerAdapter aria-label="Date" onKeyDown={(event) => event.preventDefault()} />);
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown', altKey: true });
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('opens with Alt+ArrowDown and ignores composition', () => {
  render(<DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" />);
  const input = screen.getByRole('textbox');
  fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true, isComposing: true });
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true });
  expect(screen.getByRole('dialog')).toBeTruthy();
});

it('serializes only published values and resets uncontrolled defaults', async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLInputElement>();
  render(
    <form>
      <DatePickerAdapter ref={ref} name="date" aria-label="Date" defaultValue="2026-10-12" />
    </form>,
  );
  const form = document.querySelector('form')!;
  expect(ref.current).toBe(screen.getByRole('textbox'));
  await user.clear(ref.current!);
  await user.type(ref.current!, '2026-10-20');
  expect(new FormData(form).getAll('date')).toEqual(['2026-10-12']);
  await user.keyboard('{Enter}');
  expect(new FormData(form).get('date')).toBe('2026-10-20');
  await act(async () => form.reset());
  expect(ref.current).toHaveProperty('value', '2026-10-12');
  expect(new FormData(form).get('date')).toBe('2026-10-12');
});

it('serializes ranges with distinct names and omits disabled values', () => {
  const { rerender } = render(
    <form>
      <DatePickerAdapter
        mode="range"
        name="period"
        aria-label="Period"
        value={['2026-10-10', '2026-10-20']}
      />
    </form>,
  );
  const form = document.querySelector('form')!;
  expect(new FormData(form).get('period.start')).toBe('2026-10-10');
  expect(new FormData(form).get('period.end')).toBe('2026-10-20');
  rerender(
    <form>
      <DatePickerAdapter
        mode="range"
        name="period"
        aria-label="Period"
        disabled
        value={['2026-10-10', '2026-10-20']}
      />
    </form>,
  );
  expect([...new FormData(form)]).toEqual([]);
});

it('does not confirm a partial range while moving to the second input', async () => {
  const user = userEvent.setup();
  render(<DatePickerAdapter mode="range" aria-label="Period" />);
  const start = screen.getByRole('textbox', { name: 'Period start' });
  await user.type(start, '2026-10-10');
  await user.click(screen.getByRole('textbox', { name: 'Period end' }));
  expect(start.getAttribute('aria-invalid')).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();
});

it('removes a surface hidden by parent overlay visibility', async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <OverlayVisibilityContext value={true}>
      <DatePickerAdapter aria-label="Date" />
    </OverlayVisibilityContext>,
  );
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  rerender(
    <OverlayVisibilityContext value={false}>
      <DatePickerAdapter aria-label="Date" />
    </OverlayVisibilityContext>,
  );
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('uses one day tab stop and has an exit when all dates are blocked', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" />);
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  expect(document.querySelectorAll('[data-date][tabindex="0"]')).toHaveLength(1);
  rerender(
    <DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" disabledDate={() => true} />,
  );
  expect(document.querySelectorAll('[data-date][tabindex="0"]')).toHaveLength(0);
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('switches month and year and respects min/max panel bounds', async () => {
  const user = userEvent.setup();
  render(
    <DatePickerAdapter
      aria-label="Date"
      defaultValue="2026-10-12"
      minDate="2026-10-01"
      maxDate="2027-03-31"
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  expect(screen.getByRole('button', { name: 'Previous month' })).toHaveProperty('disabled', true);
  await user.selectOptions(screen.getByRole('combobox', { name: 'Month' }), '12');
  expect(screen.getByRole('grid').getAttribute('aria-label')).toContain('December');
  const year = screen.getByRole('spinbutton', { name: 'Year' });
  fireEvent.change(year, { target: { value: '2027' } });
  expect(screen.getByRole('grid').getAttribute('aria-label')).toContain('March');
  expect(screen.getByRole('button', { name: 'Next month' })).toHaveProperty('disabled', true);
});

it('does not duplicate change under StrictMode or allow readOnly edits', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <StrictMode>
      <DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" onChange={change} readOnly />
    </StrictMode>,
  );
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  await user.keyboard('{ArrowRight}{Enter}');
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox')).toHaveProperty('value', '2026-10-12');
});

it('accepts a year typed across several keystrokes', async () => {
  const user = userEvent.setup();
  render(
    <DatePickerAdapter
      aria-label="Date"
      defaultValue="2026-10-12"
      minDate="2026-01-01"
      maxDate="2028-12-31"
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  const year = screen.getByRole('spinbutton', { name: 'Year' });
  await user.clear(year);
  await user.type(year, '2027{Enter}');
  expect(screen.getByRole('grid').getAttribute('aria-label')).toContain('2027');
});

it('allows Tab to leave the popup and preserves the destination focus', async () => {
  const user = userEvent.setup();
  render(
    <>
      <DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" />
      <button>Outside</button>
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('navigates weeks, months and years without choosing while moving', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<DatePickerAdapter aria-label="Date" defaultValue="2024-01-31" onChange={change} />);
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  await user.keyboard('{PageDown}');
  expect(document.activeElement?.getAttribute('data-date')).toBe('2024-02-29');
  await user.keyboard('{Shift>}{PageDown}{/Shift}');
  expect(document.activeElement?.getAttribute('data-date')).toBe('2025-02-28');
  await user.keyboard('{Home}');
  expect(document.activeElement?.getAttribute('data-date')).toBe('2025-02-24');
  await user.keyboard('{End}');
  expect(document.activeElement?.getAttribute('data-date')).toBe('2025-03-02');
  expect(change).not.toHaveBeenCalled();
});
