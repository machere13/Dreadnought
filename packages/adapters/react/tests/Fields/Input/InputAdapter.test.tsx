import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { InputAdapter } from '../../../src/Fields/Input/InputAdapter.tsx';

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
  expect(input.parentElement?.getAttribute('data-ui')).toBe('input');
  expect(input.getAttribute('data-slot')).toBe('control');
});

it('marks the wrapper invalid when aria-invalid is supplied natively', () => {
  render(<InputAdapter aria-label="Email" aria-invalid="true" />);
  const input = screen.getByRole('textbox', { name: 'Email' });
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.parentElement?.hasAttribute('data-invalid')).toBe(true);
});

it('puts class and style on the wrapper while keeping native props and ref on the input', () => {
  const ref = createRef<HTMLInputElement>();
  render(<InputAdapter id="search" aria-label="Search" className="custom" style={{ color: 'red' }} ref={ref} />);
  const input = screen.getByRole('textbox', { name: 'Search' });
  expect(ref.current).toBe(input);
  expect(input.id).toBe('search');
  expect(input.parentElement?.classList.contains('custom')).toBe(true);
  expect(input.parentElement?.getAttribute('style')).toBe('color: red;');
  expect(input.classList.contains('custom')).toBe(false);
});

it('reveals a password without changing its value or submitting the form', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <label htmlFor="password">Password</label>
      <InputAdapter id="password" name="password" type="password" defaultValue="secret" passwordVisibilityLabels={{ show: 'Show password', hide: 'Hide password' }} />
    </form>,
  );
  const input = screen.getByLabelText('Password') as HTMLInputElement;
  expect(input.type).toBe('password');
  await user.click(screen.getByRole('button', { name: 'Show password' }));
  expect(input.type).toBe('text');
  expect(input.value).toBe('secret');
  expect(screen.getByRole('button', { name: 'Hide password' }).getAttribute('type')).toBe('button');
  expect(onSubmit).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Hide password' }));
  expect(input.type).toBe('password');
});

it('disables password visibility control with a disabled input', () => {
  render(<InputAdapter aria-label="Password" type="password" disabled />);
  expect(screen.getByRole('button', { name: 'Show password' }).hasAttribute('disabled')).toBe(true);
});
