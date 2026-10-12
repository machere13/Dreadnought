import { StrictMode, createRef } from 'react';
import { flushSync } from 'react-dom';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TimePickerAdapter, FormAdapter, ModalAdapter } from '../../../src/unstyled.ts';
import { useForm } from '../../../src/logic.ts';
import { OverlayVisibilityContext } from '../../../src/shared/OverlayVisibilityContext.ts';

afterEach(cleanup);
const input = () => screen.getByRole('textbox', { name: 'Time' }) as HTMLInputElement;

describe('time picker adapter', () => {
  it('blocks invalid controlled Form submissions inside an iframe document', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const sent: unknown[] = [];
    function Example() {
      const form = useForm({ initialValues: { time: '09:00:00' as string | null } });
      const time = form.field('time');
      return <FormAdapter form={form} onFinish={values => { sent.push(values.time); }}>
        <TimePickerAdapter aria-label="Time" value={time.value} onChange={time.setValue} />
      </FormAdapter>;
    }
    try {
      const doc = frame.contentDocument!;
      render(<Example />, { container: doc.body });
      const field = within(doc.body).getByRole('textbox') as HTMLInputElement;
      fireEvent.change(field, { target: { value: '25:00' } });
      expect(field.validity.customError).toBe(true);
      await act(async () => field.form!.requestSubmit());
      expect(sent).toEqual([]);
      fireEvent.change(field, { target: { value: '10:07' } });
      await act(async () => field.form!.requestSubmit());
      expect(sent).toEqual(['10:07:00']);
    } finally { cleanup(); frame.remove(); }
  });
  it('scrolls every selected unit into its own column on opening', async () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    const geometry = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.matches('[role="option"], [data-slot="column"]')) {
          const column = this.closest<HTMLElement>('[data-slot="column"]');
          const top = this.matches('[role="option"]')
            ? Number(this.dataset.timeValue) * 35 - (column?.scrollTop ?? 0)
            : 0;
          const height = this.matches('[role="option"]') ? 32 : 100;
          return {
            x: 0,
            y: top,
            top,
            bottom: top + height,
            left: 0,
            right: 64,
            width: 64,
            height,
            toJSON() {
              return {};
            },
          };
        }
        return original.call(this);
      });
    try {
      const user = userEvent.setup();
      render(<TimePickerAdapter aria-label="Time" showSeconds defaultValue="09:30:15" />);
      await user.click(screen.getByRole('button', { name: 'Open time picker' }));
      const positions = ['Hours', 'Minutes', 'Seconds'].map(
        (name) => screen.getByRole('listbox', { name }).scrollTop,
      );
      expect(positions).toEqual([247, 982, 457]);
    } finally {
      geometry.mockRestore();
    }
  });
  it('closes only the time popup on the first Escape inside Modal', async () => {
    const show = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
    const close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value() {
          this.open = true;
        },
      },
      close: {
        configurable: true,
        value() {
          this.open = false;
          this.dispatchEvent(new Event('close'));
        },
      },
    });
    try {
      const user = userEvent.setup();
      render(
        <ModalAdapter
          defaultOpen
          aria-label="Booking"
          content={<TimePickerAdapter aria-label="Time" defaultValue="09:00:00" />}
        >
          {(trigger) => <button {...trigger}>Booking</button>}
        </ModalAdapter>,
      );
      await user.click(screen.getByRole('button', { name: 'Open time picker' }));
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog', { name: 'Time picker' })).toBeNull();
      expect(screen.getByRole('dialog', { name: 'Booking' })).not.toBeNull();
      const escape = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      fireEvent(document.activeElement!, escape);
      expect(escape.defaultPrevented).toBe(false);
      fireEvent(
        screen.getByRole('dialog', { name: 'Booking' }),
        new Event('cancel', { cancelable: true }),
      );
      expect(screen.queryByRole('dialog', { name: 'Booking' })).toBeNull();
    } finally {
      cleanup();
      if (show) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', show);
      else delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
      if (close) Object.defineProperty(HTMLDialogElement.prototype, 'close', close);
      else delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
    }
  });
  it('keeps keyboard focus in the input owner document', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    try {
      const doc = frame.contentDocument!;
      render(<TimePickerAdapter aria-label="Time" defaultValue="09:00:00" />, {
        container: doc.body,
      });
      const field = within(doc.body).getByRole('textbox');
      fireEvent.keyDown(field, { key: 'ArrowDown', altKey: true });
      expect(doc.activeElement?.getAttribute('data-time-value')).toBe('9');
      fireEvent.keyDown(doc.activeElement!, { key: 'ArrowDown' });
      expect(doc.activeElement?.getAttribute('data-time-value')).toBe('10');
      fireEvent.keyDown(doc.activeElement!, { key: 'Escape' });
      expect(doc.activeElement).toBe(field);
    } finally {
      cleanup();
      frame.remove();
    }
  });
  it('clears a controlled invalid draft when Form resets an unchanged accepted value', async () => {
    function Example() {
      const form = useForm({ initialValues: { time: '09:00:00' as string | null } });
      const time = form.field('time');
      return (
        <FormAdapter form={form}>
          <TimePickerAdapter aria-label="Time" value={time.value} onChange={time.setValue} />
          <button type="reset">Reset</button>
        </FormAdapter>
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    fireEvent.change(input(), { target: { value: '25:00' } });
    await user.click(screen.getByText('Reset'));
    expect(input().value).toBe('09:00');
    expect(input().validity.customError).toBe(false);
  });
  it('confirms one canonical value before React submit capture', () => {
    const captured: unknown[] = [];
    render(
      <form
        onSubmitCapture={(event) => {
          captured.push(new FormData(event.currentTarget).getAll('time'));
          event.preventDefault();
        }}
      >
        <TimePickerAdapter aria-label="Time" name="time" defaultValue="09:00:00" />
      </form>,
    );
    fireEvent.change(input(), { target: { value: '10:07' } });
    act(() => input().form!.requestSubmit());
    expect(captured).toEqual([['10:07:00']]);
  });
  it('blocks invalid and incomplete drafts before blur and clears validity on correction', () => {
    const submitted = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted();
        }}
      >
        <TimePickerAdapter aria-label="Time" name="time" defaultValue="09:00:00" />
      </form>,
    );
    for (const text of ['25:00', '10:']) {
      fireEvent.change(input(), { target: { value: text } });
      expect(input().validity.customError).toBe(true);
      act(() => input().form!.requestSubmit());
    }
    expect(submitted).not.toHaveBeenCalled();
    fireEvent.change(input(), { target: { value: '10:07' } });
    expect(input().validity.customError).toBe(false);
    act(() => input().form!.requestSubmit());
    expect(submitted).toHaveBeenCalledTimes(1);
  });
  it('tracks a late-mounted and replaced external form', () => {
    const captured: unknown[] = [];
    const field = (
      <TimePickerAdapter aria-label="Time" name="time" form="booking" defaultValue="09:00:00" />
    );
    const external = (key: string) => (
      <form
        key={key}
        id="booking"
        onSubmitCapture={(event) => {
          captured.push(new FormData(event.currentTarget).get('time'));
          event.preventDefault();
        }}
      />
    );
    const { rerender } = render(field);
    rerender(
      <>
        {field}
        {external('first')}
      </>,
    );
    fireEvent.change(input(), { target: { value: '10:07' } });
    act(() => input().form!.requestSubmit());
    rerender(
      <>
        {field}
        {external('second')}
      </>,
    );
    fireEvent.change(input(), { target: { value: '11:08' } });
    act(() => input().form!.requestSubmit());
    expect(captured).toEqual(['10:07:00', '11:08:00']);
  });
  it('resets native defaults and ignores a cancelled reset', async () => {
    const { rerender } = render(
      <form>
        <TimePickerAdapter aria-label="Time" defaultValue="09:00:00" />
      </form>,
    );
    fireEvent.change(input(), { target: { value: '25:00' } });
    await act(async () => input().form!.reset());
    expect(input().value).toBe('09:00');
    expect(input().validity.customError).toBe(false);
    rerender(
      <form onReset={(event) => event.preventDefault()}>
        <TimePickerAdapter aria-label="Time" defaultValue="09:00:00" />
      </form>,
    );
    fireEvent.change(input(), { target: { value: '10:07' } });
    await act(async () => input().form!.reset());
    expect(input().value).toBe('10:07');
  });
  it('does not apply a queued reset from a previous form association', async () => {
    const renderField = (form: string) => (
      <>
        <form id="one" />
        <form id="two" />
        <TimePickerAdapter aria-label="Time" form={form} defaultValue="09:00:00" />
      </>
    );
    const { rerender } = render(renderField('one'));
    fireEvent.change(input(), { target: { value: '10:07' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    await act(async () => {
      input().form!.reset();
      flushSync(() => rerender(renderField('two')));
      expect(input().form?.id).toBe('two');
    });
    expect(input().value).toBe('10:07');
  });
  it('uses native required and excludes disabled fields from FormData', () => {
    const { rerender } = render(
      <form>
        <TimePickerAdapter aria-label="Time" name="time" required />
      </form>,
    );
    expect(input().validity.valueMissing).toBe(true);
    expect(new FormData(input().form!).getAll('time')).toEqual(['']);
    rerender(
      <form>
        <TimePickerAdapter aria-label="Time" name="time" required disabled />
      </form>,
    );
    expect(input().willValidate).toBe(false);
    expect(new FormData(input().form!).has('time')).toBe(false);
  });
  it('supports controlled Form and does not submit its previous value for invalid text', async () => {
    const finished: unknown[] = [];
    function Example() {
      const form = useForm({ initialValues: { time: '09:00:00' as string | null } });
      const time = form.field('time');
      return (
        <FormAdapter
          form={form}
          onFinish={(values) => {
            finished.push(values.time);
          }}
        >
          <TimePickerAdapter
            aria-label="Time"
            name="time"
            value={time.value}
            onChange={time.setValue}
          />
          <button type="submit">Save</button>
          <button type="reset">Reset</button>
        </FormAdapter>
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    fireEvent.change(input(), { target: { value: '25:00' } });
    await user.click(screen.getByText('Save'));
    expect(finished).toEqual([]);
    fireEvent.change(input(), { target: { value: '10:07' } });
    await user.click(screen.getByText('Save'));
    expect(finished).toEqual(['10:07:00']);
    await user.click(screen.getByText('Reset'));
    expect(input().value).toBe('09:00');
  });
  it('moves between named columns, skips disabled options and confirms only on request', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <TimePickerAdapter
        aria-label="Time"
        defaultValue="09:00:00"
        onChange={changed}
        disabledTime={{ hours: [10] }}
        showSeconds
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Open time picker' }));
    expect(document.activeElement?.getAttribute('data-time-value')).toBe('9');
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement?.getAttribute('data-time-value')).toBe('11');
    expect(changed).not.toHaveBeenCalled();
    await user.keyboard('{Enter}{ArrowRight}');
    expect(document.activeElement?.getAttribute('data-time-part')).toBe('minute');
    await user.keyboard('{End}{Enter}{ArrowRight}');
    expect(document.activeElement?.getAttribute('data-time-part')).toBe('second');
    expect(changed).not.toHaveBeenCalled();
    expect(input().value).toBe('11:59:00');
    await user.click(screen.getByRole('button', { name: 'Confirm time' }));
    expect(changed).toHaveBeenCalledWith('11:59:00');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('keeps one tab stop per column and permits native Tab to leave', async () => {
    const user = userEvent.setup();
    render(
      <>
        <TimePickerAdapter aria-label="Time" defaultValue="09:00:00" />
        <button>Outside</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Open time picker' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelectorAll('[role="option"][tabindex="0"]')).toHaveLength(2);
    await user.tab();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Outside'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('has an exit when all options are disabled and preserves readonly values', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TimePickerAdapter
        aria-label="Time"
        disabledTime={{ hours: Array.from({ length: 24 }, (_, i) => i) }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Open time picker' }));
    expect(screen.getByRole('button', { name: 'Confirm time' })).toHaveProperty('disabled', true);
    expect(document.querySelectorAll('[role="option"][tabindex="0"]')).toHaveLength(0);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<TimePickerAdapter aria-label="Time" value="09:00:00" readOnly />);
    await user.click(screen.getByRole('button', { name: 'Open time picker' }));
    await user.click(
      within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', {
        name: 'Hours 10',
      }),
    );
    expect(input().value).toBe('09:00');
    expect(screen.queryByRole('button', { name: 'Clear time' })).toBeNull();
  });
  it('preserves ref and honors prevented and composing keys', () => {
    const ref = createRef<HTMLInputElement>();
    const changed = vi.fn();
    render(
      <StrictMode>
        <TimePickerAdapter
          ref={ref}
          aria-label="Time"
          onChange={changed}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.preventDefault();
          }}
        />
      </StrictMode>,
    );
    expect(ref.current).toBe(input());
    fireEvent.change(input(), { target: { value: '10:07' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    fireEvent.keyDown(input(), { key: 'ArrowDown', altKey: true, isComposing: true });
    expect(changed).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('removes hidden overlay content and cancels draft with Escape', async () => {
    const user = userEvent.setup();
    const renderField = (visible: boolean) => (
      <OverlayVisibilityContext value={visible}>
        <TimePickerAdapter aria-label="Time" defaultValue="09:00:00" />
      </OverlayVisibilityContext>
    );
    const { rerender } = render(renderField(true));
    fireEvent.change(input(), { target: { value: '10:07' } });
    await user.keyboard('{Escape}');
    fireEvent.keyDown(input(), { key: 'Escape' });
    expect(input().value).toBe('09:00');
    await user.click(screen.getByRole('button', { name: 'Open time picker' }));
    rerender(renderField(false));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
