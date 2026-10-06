import { StrictMode, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import * as adapters from '../../../src/unstyled.ts';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function example(props = {}) {
  expect(adapters).toHaveProperty('PopoverAdapter');
  return render(<><adapters.PopoverAdapter content={<input aria-label="Name" />} {...props}>
    {trigger => <button {...trigger}>Settings</button>}
  </adapters.PopoverAdapter><button>Outside</button></>);
}
it('opens on click, focuses content and toggles without submitting a form', () => {
  expect(adapters).toHaveProperty('PopoverAdapter');
  const submit = vi.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><adapters.PopoverAdapter content={<input aria-label="Name" />}>
    {trigger => <button {...trigger}>Settings</button>}
  </adapters.PopoverAdapter></form>);
  const trigger = screen.getByRole('button');
  fireEvent.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Settings' }).getAttribute('aria-modal')).toBe('false');
  expect(document.activeElement).toBe(screen.getByRole('textbox'));
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(trigger.getAttribute('aria-controls')).toBe(screen.getByRole('dialog').id);
  fireEvent.click(trigger); expect(screen.queryByRole('dialog')).toBeNull(); expect(submit).not.toHaveBeenCalled();
});
it('returns focus to the trigger on Escape and respects prevented or composing events', () => {
  example(); const trigger = screen.getByRole('button', { name: 'Settings' }); fireEvent.click(trigger);
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape', isComposing: true }); expect(screen.getByRole('dialog')).toBeTruthy();
  const cancelled = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }); cancelled.preventDefault();
  fireEvent(screen.getByRole('textbox'), cancelled); expect(screen.getByRole('dialog')).toBeTruthy();
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger);
});
it('keeps inside interactions open and preserves outside click focus', async () => {
  const user = userEvent.setup(); example(); await user.click(screen.getByRole('button', { name: 'Settings' }));
  await user.type(screen.getByRole('textbox'), 'Ada'); expect(screen.getByRole('dialog')).toBeTruthy();
  const outside = screen.getByRole('button', { name: 'Outside' }); await user.click(outside);
  expect(screen.queryByRole('dialog')).toBeNull(); expect(document.activeElement).toBe(outside);
});
it('allows Tab to leave rather than trapping focus', async () => {
  const user = userEvent.setup(); example(); await user.click(screen.getByRole('button', { name: 'Settings' }));
  await user.tab(); expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
it('closes on backward Tab to the trigger without reopening on the next click', async () => {
  const user = userEvent.setup(); example(); const trigger = screen.getByRole('button', { name: 'Settings' });
  await user.click(trigger); await user.tab({ shift: true });
  expect(document.activeElement).toBe(trigger); expect(screen.queryByRole('dialog')).toBeNull();
  await user.click(trigger); expect(screen.getByRole('dialog')).toBeTruthy();
  await user.click(trigger); expect(screen.queryByRole('dialog')).toBeNull();
});
it('skips disabled and visually hidden ancestors when choosing initial focus', () => {
  example({ content: <><div style={{ display: 'none' }}><input aria-label="Hidden" /></div><input disabled aria-label="Disabled" /><input aria-label="Visible" /></> });
  fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
  expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Visible' }));
});
it('focuses the dialog when content has no focusable controls and exposes an explicit close action', () => {
  expect(adapters).toHaveProperty('PopoverAdapter');
  const { unmount } = example({ content: 'Information', defaultOpen: true });
  expect(document.activeElement).toBe(screen.getByRole('dialog'));
  unmount();
  render(<adapters.PopoverAdapter content={({ close }) => <button onClick={close}>Done</button>}>
    {trigger => <button {...trigger}>Settings</button>}
  </adapters.PopoverAdapter>);
  fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(screen.queryByRole('dialog')).toBeNull(); expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Settings' }));
});
it('preserves controlled ownership and does not steal focus when a close request is refused', () => {
  const change = vi.fn(); const { rerender } = example({ open: false, onOpenChange: change });
  fireEvent.click(screen.getByRole('button', { name: 'Settings' })); expect(change).toHaveBeenCalledWith(true);
  expect(screen.queryByRole('dialog')).toBeNull();
  rerender(<adapters.PopoverAdapter open content={<input aria-label="Name" />} onOpenChange={change}>
    {trigger => <button {...trigger}>Settings</button>}
  </adapters.PopoverAdapter>);
  const field = screen.getByRole('textbox'); fireEvent.keyDown(field, { key: 'Escape' });
  expect(change).toHaveBeenLastCalledWith(false); expect(screen.getByRole('dialog')).toBeTruthy(); expect(document.activeElement).toBe(field);
  rerender(<adapters.PopoverAdapter open={false} content="Closed">{trigger => <button {...trigger}>Settings</button>}</adapters.PopoverAdapter>);
  expect(screen.queryByRole('dialog')).toBeNull(); expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Settings' }));
});
it.each([false, true])('restores externally closed content focus without stealing outside focus (%s)', outside => {
  function Page({ open }: { open: boolean }) { return <><adapters.PopoverAdapter open={open} content={<input aria-label="Name" />}>
    {trigger => <button {...trigger}>Settings</button>}
  </adapters.PopoverAdapter><button>Outside</button></>; }
  const { rerender } = render(<Page open />);
  if (outside) act(() => screen.getByRole('button', { name: 'Outside' }).focus());
  rerender(<Page open={false} />);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: outside ? 'Outside' : 'Settings' }));
});
it('does not open disabled popovers and keeps placement options out of the DOM', () => {
  const { rerender } = example({ disabled: true }); fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  rerender(<adapters.PopoverAdapter content="Info" placement="right" arrow={false} autoAdjustOverflow={false}>
    {trigger => <button {...trigger}>Settings</button>}
  </adapters.PopoverAdapter>);
  fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
  const dialog = screen.getByRole('dialog'); expect(dialog.getAttribute('data-placement')).toBe('right');
  expect(dialog.querySelector('[data-ui="popover-arrow"]')).toBeNull();
  expect(dialog.hasAttribute('placement')).toBe(false); expect(dialog.hasAttribute('autoAdjustOverflow')).toBe(false);
});
it('closes only the nested popover on Escape and leaves the parent open', () => {
  expect(adapters).toHaveProperty('PopoverAdapter');
  render(<adapters.PopoverAdapter content={<adapters.PopoverAdapter content={<input aria-label="Inner" />}>
    {trigger => <button {...trigger}>Inner settings</button>}
  </adapters.PopoverAdapter>}>
    {trigger => <button {...trigger}>Outer settings</button>}
  </adapters.PopoverAdapter>);
  fireEvent.click(screen.getByRole('button', { name: 'Outer settings' }));
  fireEvent.click(screen.getByRole('button', { name: 'Inner settings' }));
  expect(screen.getAllByRole('dialog')).toHaveLength(2);
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
  expect(screen.getAllByRole('dialog')).toHaveLength(1); expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inner settings' }));
});
it('isolates sibling popovers and cleans up document listeners on unmount', () => {
  expect(adapters).toHaveProperty('PopoverAdapter'); const change = vi.fn();
  function Page() { const [open, setOpen] = useState(false); return <adapters.PopoverAdapter open={open} onOpenChange={next => { change(next); setOpen(next); }} content="Info">{trigger => <button {...trigger}>Settings</button>}</adapters.PopoverAdapter>; }
  const { unmount } = render(<StrictMode><Page /></StrictMode>);
  fireEvent.click(screen.getByRole('button')); expect(screen.getByRole('dialog')).toBeTruthy();
  unmount(); change.mockClear(); fireEvent.pointerDown(document.body); fireEvent.keyDown(document, { key: 'Escape' });
  expect(change).not.toHaveBeenCalled();
});
