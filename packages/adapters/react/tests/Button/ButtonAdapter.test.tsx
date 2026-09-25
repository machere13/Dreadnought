import { createRef } from 'react';
import type { FormEvent } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonAdapter } from '../../src/Button/ButtonAdapter.js';

afterEach(cleanup);

describe('ButtonAdapter', () => {
  it('defaults to a non-submitting native button', () => {
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const click = vi.fn();
    render(<form onSubmit={submit}><ButtonAdapter onClick={click}>Save</ButtonAdapter></form>);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(click).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });

  it('keeps a loading button focusable and blocks a submit action', async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const click = vi.fn();
    render(<form onSubmit={submit}><ButtonAdapter loading type="submit" onClick={click}>Save</ButtonAdapter></form>);

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
    render(<form onSubmit={submit}><ButtonAdapter type="submit">Send</ButtonAdapter></form>);

    screen.getByRole('button', { name: 'Send' }).focus();
    await user.keyboard('{Enter}');
    expect(submit).toHaveBeenCalledOnce();
  });

  it('forwards native attributes and the ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ButtonAdapter ref={ref} aria-label="Close" className="custom" disabled>×</ButtonAdapter>);

    const button = screen.getByRole('button', { name: 'Close' });
    expect(ref.current).toBe(button);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.className).toBe('custom');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('uses native disabled semantics and never calls the action', async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(<ButtonAdapter disabled onClick={click}>Save</ButtonAdapter>);

    const button = screen.getByRole('button', { name: 'Save' });
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter} ');

    expect(button.hasAttribute('disabled')).toBe(true);
    expect(click).not.toHaveBeenCalled();
  });

  it('restores its action when loading ends', () => {
    const click = vi.fn();
    const { rerender } = render(<ButtonAdapter loading onClick={click}>Save</ButtonAdapter>);
    const button = screen.getByRole('button', { name: 'Save' });

    fireEvent.click(button);
    rerender(<ButtonAdapter onClick={click}>Save</ButtonAdapter>);
    fireEvent.click(button);

    expect(button.hasAttribute('aria-busy')).toBe(false);
    expect(click).toHaveBeenCalledOnce();
  });
});
