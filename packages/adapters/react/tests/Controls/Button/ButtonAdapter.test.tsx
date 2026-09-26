import { createRef } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonAdapter } from '../../../src/Controls/Button/ButtonAdapter.tsx';

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

  it('places the icon before the label by default', () => {
    render(<ButtonAdapter icon={<svg />}>Search</ButtonAdapter>);

    const button = screen.getByRole('button', { name: 'Search' });
    expect(button.children[0]?.getAttribute('data-slot')).toBe('icon');
    expect(button.children[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(button.children[1]?.getAttribute('data-slot')).toBe('label');
  });

  it('places the icon after the label when requested', () => {
    render(<ButtonAdapter icon={<svg />} iconPosition="end">Search</ButtonAdapter>);

    const button = screen.getByRole('button', { name: 'Search' });
    expect(button.children[0]?.getAttribute('data-slot')).toBe('label');
    expect(button.children[1]?.getAttribute('data-slot')).toBe('icon');
  });

  it('supports an icon-only button with an explicit accessible name', () => {
    render(<ButtonAdapter icon={<svg />} aria-label="Search" />);

    const button = screen.getByRole('button', { name: 'Search' });
    expect(button.querySelector('[data-slot="icon"]')).not.toBeNull();
    expect(button.querySelector('[data-slot="label"]')).toBeNull();
  });

  it('renders href as a native link and forwards link attributes', () => {
    const click = vi.fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    const ref = createRef<HTMLAnchorElement>();
    render(<ButtonAdapter href="/docs" target="_blank" ref={ref} onClick={click}>Docs</ButtonAdapter>);

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(ref.current).toBe(link);
    fireEvent.click(link);
    expect(click).toHaveBeenCalledOnce();
  });

  it('removes navigation when a link is disabled', () => {
    const click = vi.fn();
    render(<ButtonAdapter href="/docs" disabled onClick={click}>Docs</ButtonAdapter>);

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.getAttribute('href')).toBeNull();
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    fireEvent.click(link);
    expect(click).not.toHaveBeenCalled();
  });

  it('keeps a loading link focusable without allowing navigation', () => {
    const click = vi.fn();
    render(<ButtonAdapter href="/docs" loading onClick={click}>Docs</ButtonAdapter>);

    const link = screen.getByRole('link', { name: 'Docs' });
    link.focus();
    expect(document.activeElement).toBe(link);
    expect(link.getAttribute('href')).toBeNull();
    expect(link.getAttribute('tabindex')).toBe('0');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(link);
    expect(click).not.toHaveBeenCalled();
  });
});
