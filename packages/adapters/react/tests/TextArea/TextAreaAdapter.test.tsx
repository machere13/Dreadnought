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
