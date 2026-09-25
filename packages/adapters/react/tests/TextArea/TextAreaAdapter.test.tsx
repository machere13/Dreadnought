import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { TextAreaAdapter } from '../../src/TextArea/TextAreaAdapter.js';

afterEach(cleanup);

it('preserves label, native attributes, ref, and controlled onChange', async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLTextAreaElement>();
  const onChange = vi.fn();
  render(<><label htmlFor="notes">Notes</label><TextAreaAdapter id="notes" ref={ref} name="notes" rows={4} value="a" onChange={onChange} required /></>);
  const area = screen.getByRole('textbox', { name: 'Notes' });
  expect(ref.current).toBe(area);
  expect(area.getAttribute('rows')).toBe('4');
  expect(area.getAttribute('name')).toBe('notes');
  expect(area.hasAttribute('required')).toBe(true);
  await user.type(area, 'b');
  expect(onChange).toHaveBeenCalled();
});

it('preserves uncontrolled, disabled, and read-only behavior', async () => {
  const user = userEvent.setup();
  render(<><TextAreaAdapter aria-label="Editable" defaultValue="a" /><TextAreaAdapter aria-label="Disabled" disabled /><TextAreaAdapter aria-label="Read only" readOnly defaultValue="x" /></>);
  const editable = screen.getByRole('textbox', { name: 'Editable' }) as HTMLTextAreaElement;
  await user.type(editable, 'b');
  expect(editable.value).toBe('ab');
  expect(screen.getByRole('textbox', { name: 'Disabled' }).hasAttribute('disabled')).toBe(true);
  expect(screen.getByRole('textbox', { name: 'Read only' }).hasAttribute('readonly')).toBe(true);
});

it('maps invalid state to aria and data attributes', () => {
  render(<TextAreaAdapter aria-label="Notes" invalid />);
  const area = screen.getByRole('textbox', { name: 'Notes' });
  expect(area.getAttribute('aria-invalid')).toBe('true');
  expect(area.hasAttribute('data-invalid')).toBe(true);
  expect(area.getAttribute('data-ui')).toBe('text-area');
});

it('auto-sizes to content within row limits and disables mouse resizing', () => {
  const ref = (node: HTMLTextAreaElement | null) => {
    if (node) Object.defineProperty(node, 'scrollHeight', { configurable: true, get: () => 100 });
  };
  render(<TextAreaAdapter aria-label="Notes" ref={ref} rows={4} minRows={2} maxRows={3} autoSize
    style={{ boxSizing: 'content-box', lineHeight: '20px', padding: 0, border: 0, resize: 'vertical' }} />);
  const area = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
  expect(area.style.height).toBe('60px');
  expect(area.style.resize).toBe('none');
  expect(area.style.overflowY).toBe('auto');
  expect(area.getAttribute('rows')).toBe('1');
  expect(area.hasAttribute('minRows')).toBe(false);
  expect(area.hasAttribute('maxRows')).toBe(false);
});

it('remeasures controlled content and restores manual mode', () => {
  let contentHeight = 20;
  const ref = (node: HTMLTextAreaElement | null) => {
    if (node) Object.defineProperty(node, 'scrollHeight', { configurable: true, get: () => contentHeight });
  };
  const style = { boxSizing: 'content-box' as const, lineHeight: '20px', padding: 0, border: 0, resize: 'vertical' as const };
  const { rerender } = render(<TextAreaAdapter aria-label="Notes" ref={ref} autoSize rows={2} maxRows={3} value="short" onChange={() => {}} style={style} />);
  const area = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
  expect(area.style.height).toBe('40px');

  contentHeight = 100;
  rerender(<TextAreaAdapter aria-label="Notes" ref={ref} autoSize rows={2} maxRows={3} value="long" onChange={() => {}} style={style} />);
  expect(area.style.height).toBe('60px');

  rerender(<TextAreaAdapter aria-label="Notes" ref={ref} rows={2} maxRows={3} value="long" onChange={() => {}} style={style} />);
  expect(area.style.height).toBe('');
  expect(area.style.resize).toBe('vertical');
  expect(area.getAttribute('rows')).toBe('2');
});

it('calculates row height from unitless line-height and font size', () => {
  const ref = (node: HTMLTextAreaElement | null) => {
    if (node) Object.defineProperty(node, 'scrollHeight', { configurable: true, get: () => 20 });
  };
  render(<TextAreaAdapter aria-label="Notes" ref={ref} autoSize rows={2}
    style={{ boxSizing: 'content-box', fontSize: '20px', lineHeight: 1.5, padding: 0, border: 0 }} />);
  const area = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
  expect(area.style.height).toBe('60px');
});

it('grows after uncontrolled input without swallowing the consumer handler', async () => {
  const user = userEvent.setup();
  const onInput = vi.fn();
  let contentHeight = 20;
  const ref = (node: HTMLTextAreaElement | null) => {
    if (node) Object.defineProperty(node, 'scrollHeight', { configurable: true, get: () => contentHeight });
  };
  render(<TextAreaAdapter aria-label="Notes" ref={ref} autoSize rows={1} onInput={onInput}
    style={{ boxSizing: 'content-box', lineHeight: '20px', padding: 0, border: 0 }} />);
  const area = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
  expect(area.style.height).toBe('20px');

  contentHeight = 80;
  await user.type(area, 'more text');
  expect(area.style.height).toBe('80px');
  expect(onInput).toHaveBeenCalled();
});
