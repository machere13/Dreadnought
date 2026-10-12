import { StrictMode, createRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { DatePickerAdapter } from '../../../src/unstyled.ts';
import { OverlayVisibilityContext } from '../../../src/shared/OverlayVisibilityContext.ts';
import { FormFieldAdapter } from '../../../src/unstyled.ts';

afterEach(cleanup);

it('confirms the draft before React submit capture reads FormData', () => {
  const captured: unknown[] = [];
  render(
    <form
      aria-label="Booking"
      onSubmitCapture={(event) => {
        captured.push(new FormData(event.currentTarget).get('date'));
        event.preventDefault();
      }}
    >
      <DatePickerAdapter name="date" aria-label="Date" defaultValue="2026-10-12" />
    </form>,
  );
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '2026-10-20' } });
  act(() => (screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement).requestSubmit());
  expect(captured).toEqual(['2026-10-20']);
});

it('confirms drafts for late-mounted and replaced external forms', () => {
  const sent: unknown[] = [];
  function Example({ revision }: { revision: number }) {
    return (
      <>
        <DatePickerAdapter
          form="external"
          name="date"
          aria-label="Date"
          defaultValue="2026-10-12"
        />
        {revision > 0 && (
          <form
            key={revision}
            id="external"
            aria-label="Booking"
            onSubmit={(event) => {
              event.preventDefault();
              sent.push(new FormData(event.currentTarget).get('date'));
            }}
          />
        )}
      </>
    );
  }
  const { rerender } = render(<Example revision={0} />);
  rerender(<Example revision={1} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '2026-10-20' } });
  act(() => (screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement).requestSubmit());
  rerender(<Example revision={2} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '2026-10-25' } });
  act(() => (screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement).requestSubmit());
  expect(sent).toEqual(['2026-10-20', '2026-10-25']);
});

it('confirms a valid draft before programmatic native submission reads FormData', () => {
  const sent: unknown[] = [];
  render(
    <form
      aria-label="Booking"
      onSubmit={(event) => {
        event.preventDefault();
        sent.push(new FormData(event.currentTarget).get('date'));
      }}
    >
      <DatePickerAdapter name="date" aria-label="Date" defaultValue="2026-10-12" />
    </form>,
  );
  const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement;
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: '2026-10-20' } });
  act(() => form.requestSubmit());
  expect(sent).toEqual(['2026-10-20']);
  fireEvent.change(input, { target: { value: 'invalid' } });
  act(() => form.requestSubmit());
  expect(sent).toEqual(['2026-10-20']);
});

it('blocks native submission of an invalid draft even before blur', async () => {
  const user = userEvent.setup();
  const submissions: string[] = [];
  render(
    <form
      aria-label="Booking"
      onSubmit={(event) => {
        event.preventDefault();
        submissions.push(String(new FormData(event.currentTarget).get('date')));
      }}
    >
      <DatePickerAdapter name="date" aria-label="Date" defaultValue="2026-10-12" />
      <button type="submit">Save</button>
    </form>,
  );
  const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement;
  const input = screen.getByRole('textbox', { name: 'Date' }) as HTMLInputElement;
  fireEvent.change(input, { target: { value: '2026-02-30' } });
  expect(form.checkValidity()).toBe(false);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(submissions).toEqual([]);
  expect(screen.getByRole('alert').textContent).toContain('YYYY-MM-DD');
  fireEvent.change(input, { target: { value: '2026-10-20' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(form.checkValidity()).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(submissions).toEqual(['2026-10-20']);
});

it('validates partial ranges and contextual restrictions through the external form', () => {
  render(
    <>
      <form id="booking" aria-label="Booking" />
      <DatePickerAdapter
        form="booking"
        mode="range"
        aria-label="Period"
        disabledDate={(date, { from }) => from !== undefined && date < from}
      />
    </>,
  );
  const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement;
  const start = screen.getByRole('textbox', { name: 'Period start' });
  const end = screen.getByRole('textbox', { name: 'Period end' });
  expect(form.checkValidity()).toBe(true);
  fireEvent.change(start, { target: { value: '2026-10-20' } });
  expect(form.checkValidity()).toBe(false);
  fireEvent.change(end, { target: { value: '2026-10-10' } });
  expect(form.checkValidity()).toBe(false);
  fireEvent.change(end, { target: { value: '2026-10-25' } });
  expect(form.checkValidity()).toBe(true);
});

it('clears native validity on cancel, reset and disable', async () => {
  const { rerender } = render(
    <form>
      <DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" />
    </form>,
  );
  const form = document.querySelector('form')!;
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'invalid' } });
  expect(form.checkValidity()).toBe(false);
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(form.checkValidity()).toBe(true);
  fireEvent.change(input, { target: { value: 'invalid' } });
  await act(async () => form.reset());
  expect(form.checkValidity()).toBe(true);
  fireEvent.change(input, { target: { value: 'invalid' } });
  rerender(
    <form>
      <DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" disabled />
    </form>,
  );
  expect(form.checkValidity()).toBe(true);
});

it('continues contextual range selection entirely by keyboard', async () => {
  const user = userEvent.setup();
  render(
    <DatePickerAdapter
      mode="range"
      aria-label="Period"
      defaultValue={['2026-10-12', '2026-10-20']}
      disabledDate={(date, { from }) => from !== undefined && date <= from}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  await user.keyboard('{Enter}');
  expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-13');
  await user.keyboard('{Enter}');
  expect(screen.getByRole('textbox', { name: 'Period end' })).toHaveProperty('value', '2026-10-13');
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('submits single and range values to their explicit external form', () => {
  render(
    <>
      <form id="external" aria-label="External" />
      <DatePickerAdapter form="external" name="date" defaultValue="2026-10-12" />
      <DatePickerAdapter
        form="external"
        mode="range"
        name="period"
        defaultValue={['2026-10-10', '2026-10-20']}
      />
    </>,
  );
  const data = new FormData(screen.getByRole('form', { name: 'External' }) as HTMLFormElement);
  expect(data.get('date')).toBe('2026-10-12');
  expect(data.get('period.start')).toBe('2026-10-10');
  expect(data.get('period.end')).toBe('2026-10-20');
});

it('distinguishes labelled range endpoints including FormField labels', () => {
  render(
    <>
      <span id="period-label">Period</span>
      <DatePickerAdapter mode="range" aria-labelledby="period-label" />
      <FormFieldAdapter label="Booking">
        {(props) => <DatePickerAdapter {...props} mode="range" />}
      </FormFieldAdapter>
    </>,
  );
  for (const name of ['Period start', 'Period end', 'Booking start', 'Booking end']) {
    expect(screen.getByRole('textbox', { name })).toBeTruthy();
  }
});

it('uses Gregorian years even when the locale defaults to another calendar', async () => {
  const user = userEvent.setup();
  render(<DatePickerAdapter defaultValue="2026-10-12" locale="th-TH" />);
  await user.click(screen.getByRole('button', { name: 'Open calendar' }));
  expect(screen.getByRole('grid').getAttribute('aria-label')).toContain('2026');
  expect(screen.getByRole('grid').getAttribute('aria-label')).not.toContain('2569');
});

it('keeps an arrowless calendar within a narrow viewport without matching anchor width', () => {
  const viewport = document.documentElement;
  const width = Object.getOwnPropertyDescriptor(viewport, 'clientWidth');
  const height = Object.getOwnPropertyDescriptor(viewport, 'clientHeight');
  Object.defineProperties(viewport, {
    clientWidth: { configurable: true, value: 390 },
    clientHeight: { configurable: true, value: 844 },
  });
  const measure = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function () {
      const popup = this.hasAttribute('popover');
      return {
        x: 70,
        y: 500,
        left: 70,
        top: 500,
        width: popup ? 366 : 280,
        height: popup ? 320 : 40,
        bottom: 540,
        right: 350,
        toJSON: () => ({}),
      };
    });
  try {
    render(<DatePickerAdapter aria-label="Date" defaultOpen />);
    expect(parseFloat(screen.getByRole('dialog').style.left)).toBeLessThanOrEqual(24);
    expect(screen.getByRole('dialog').style.minWidth).toBe('0px');
  } finally {
    cleanup();
    measure.mockRestore();
    if (width) Object.defineProperty(viewport, 'clientWidth', width);
    else Reflect.deleteProperty(viewport, 'clientWidth');
    if (height) Object.defineProperty(viewport, 'clientHeight', height);
    else Reflect.deleteProperty(viewport, 'clientHeight');
  }
});

it('focuses the calendar only after the native popover is shown', async () => {
  const nativeFocus = HTMLElement.prototype.focus;
  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'showPopover');
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value() {
      this.dataset.shown = 'true';
    },
  });
  const focus = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function () {
    const popup = this.closest<HTMLElement>('[popover]');
    if (!popup || popup.dataset.shown === 'true') nativeFocus.call(this);
  });
  try {
    const user = userEvent.setup();
    render(<DatePickerAdapter aria-label="Date" defaultValue="2026-10-12" />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-12');
  } finally {
    cleanup();
    focus.mockRestore();
    if (descriptor) Object.defineProperty(HTMLElement.prototype, 'showPopover', descriptor);
    else Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
  }
});

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
