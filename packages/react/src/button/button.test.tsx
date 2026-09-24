import { createRef } from 'react';
import type { FormEvent } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from './button.js';
import { ButtonBase } from './button-base.js';

afterEach(cleanup);

describe('Button', () => {
  it('defaults to a non-submitting native button', () => {
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const click = vi.fn();
    render(<form onSubmit={submit}><Button onClick={click}>Save</Button></form>);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(click).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });

  it('keeps a loading button focusable and blocks a submit action', async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const click = vi.fn();
    render(<form onSubmit={submit}><Button loading type="submit" onClick={click}>Save</Button></form>);

    const button = screen.getByRole('button', { name: 'Save' });
    button.focus();
    fireEvent.click(button);
    await user.keyboard('{Enter}');

    expect(document.activeElement).toBe(button);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(click).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it('submits a form when explicitly asked to', async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    render(<form onSubmit={submit}><Button type="submit">Send</Button></form>);

    screen.getByRole('button', { name: 'Send' }).focus();
    await user.keyboard('{Enter}');
    expect(submit).toHaveBeenCalledOnce();
  });

  it('forwards native attributes and the ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ButtonBase ref={ref} aria-label="Close" className="custom" disabled>×</ButtonBase>);

    const button = screen.getByRole('button', { name: 'Close' });
    expect(ref.current).toBe(button);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.className).toBe('custom');
    expect(button.hasAttribute('disabled')).toBe(true);
  });
});
