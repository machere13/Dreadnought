import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { InputAdapter } from '../../src/Input/InputAdapter.js';

afterEach(cleanup);

it('keeps native controlled input, label, attributes and ref', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const ref = createRef<HTMLInputElement>();
  render(<><label htmlFor="email">Email</label><InputAdapter id="email" type="email" value="a" onChange={onChange} ref={ref} name="email" required /></>);
  const input = screen.getByRole('textbox', { name: 'Email' });
  expect(ref.current).toBe(input);
  expect(input.getAttribute('type')).toBe('email');
  expect(input.getAttribute('name')).toBe('email');
  expect(input.hasAttribute('required')).toBe(true);
  await user.type(input, 'b');
  expect(onChange).toHaveBeenCalled();
});

it('supports uncontrolled values and native disabled and read-only states', async () => {
  const user = userEvent.setup();
  render(<><InputAdapter aria-label="Editable" defaultValue="a" /><InputAdapter aria-label="Disabled" disabled /><InputAdapter aria-label="Read only" readOnly defaultValue="x" /></>);
  const editable = screen.getByRole('textbox', { name: 'Editable' }) as HTMLInputElement;
  await user.type(editable, 'b');
  expect(editable.value).toBe('ab');
  expect(screen.getByRole('textbox', { name: 'Disabled' }).hasAttribute('disabled')).toBe(true);
  expect(screen.getByRole('textbox', { name: 'Read only' }).hasAttribute('readonly')).toBe(true);
});

it('maps invalid state to aria and data attributes without inventing validation', () => {
  render(<InputAdapter aria-label="Email" invalid />);
  const input = screen.getByRole('textbox', { name: 'Email' });
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.hasAttribute('data-invalid')).toBe(true);
  expect(input.getAttribute('data-ui')).toBe('input');
});
