import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { DisclosureDemo } from '../src/content/guides/DisclosureDemo.tsx';

afterEach(cleanup);
const trigger = () => screen.getByRole('button', { name: 'Дополнительные настройки' });

it('connects IDs, restores focus and preserves mounted input state', async () => {
  render(<DisclosureDemo />);
  expect(trigger().getAttribute('aria-expanded')).toBe('false');
  await userEvent.click(trigger());
  const input = screen.getByRole('textbox', { name: 'Примечание' });
  expect(trigger().getAttribute('aria-controls')).toBe(input.parentElement!.id);
  await userEvent.type(input, 'черновик');
  await userEvent.click(screen.getByRole('button', { name: 'Закрыть настройки' }));
  expect(document.activeElement).toBe(trigger());
  await userEvent.click(trigger());
  expect((screen.getByRole('textbox', { name: 'Примечание' }) as HTMLInputElement).value).toBe('черновик');
});

it('uses native Enter and Space without submitting', async () => {
  const submit = vi.fn(event => event.preventDefault());
  const change = vi.fn();
  render(<form onSubmit={submit}><DisclosureDemo onOpenChange={change} /></form>);
  trigger().focus();
  await userEvent.keyboard('{Enter}');
  expect(trigger().getAttribute('aria-expanded')).toBe('true');
  await userEvent.keyboard(' ');
  expect(trigger().getAttribute('aria-expanded')).toBe('false');
  expect(change.mock.calls).toEqual([[true], [false]]);
  expect(submit).not.toHaveBeenCalled();
});

it.each([false, true])('keeps disabled state unchanged when open=%s', async open => {
  const change = vi.fn();
  render(<DisclosureDemo defaultOpen={open} disabled onOpenChange={change} />);
  await userEvent.click(trigger());
  expect(trigger().getAttribute('aria-expanded')).toBe(String(open));
  expect(change).not.toHaveBeenCalled();
});

it('honors canceled consumer clicks', async () => {
  render(<DisclosureDemo onTriggerClick={event => event.preventDefault()} />);
  await userEvent.click(trigger());
  expect(trigger().getAttribute('aria-expanded')).toBe('false');
});

it('requests controlled changes without owning the state', async () => {
  const change = vi.fn();
  const { rerender } = render(<DisclosureDemo open={false} onOpenChange={change} />);
  await userEvent.click(trigger());
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(trigger().getAttribute('aria-expanded')).toBe('false');
  rerender(<DisclosureDemo open onOpenChange={change} />);
  expect(trigger().getAttribute('aria-expanded')).toBe('true');
});

it('restores only focus inside the panel on a closing transition', () => {
  const view = (open: boolean) => <><DisclosureDemo open={open} /><button>Outside</button></>;
  const { rerender } = render(view(true));
  screen.getByRole('textbox').focus();
  rerender(view(false));
  expect(document.activeElement).toBe(trigger());
  rerender(view(true));
  const outside = screen.getByRole('button', { name: 'Outside' });
  outside.focus();
  rerender(view(false));
  expect(document.activeElement).toBe(outside);
  rerender(view(false));
  expect(document.activeElement).toBe(outside);
});

it('gives separate instances distinct IDs', () => {
  render(<><DisclosureDemo /><DisclosureDemo /></>);
  const buttons = screen.getAllByRole('button', { name: 'Дополнительные настройки' });
  expect(new Set(buttons.map(button => button.id)).size).toBe(2);
  expect(new Set(buttons.map(button => button.getAttribute('aria-controls'))).size).toBe(2);
});

it('does not enable a disabled trigger to restore focus', () => {
  const { rerender } = render(<DisclosureDemo open disabled />);
  screen.getByRole('textbox').focus();
  rerender(<DisclosureDemo open={false} disabled />);
  expect(trigger().hasAttribute('disabled')).toBe(true);
  expect(document.activeElement).not.toBe(trigger());
});
