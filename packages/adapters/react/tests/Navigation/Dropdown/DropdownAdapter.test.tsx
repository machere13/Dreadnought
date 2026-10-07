import { StrictMode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import * as adapters from '../../../src/unstyled.ts';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const items = [{ value: 'edit', label: 'Edit' }, { value: 'delete', label: 'Delete', disabled: true }, { value: 'save', label: 'Save' }];
function example(props = {}) {
  expect(typeof adapters.DropdownAdapter).toBe('function');
  return render(<StrictMode><adapters.DropdownAdapter items={items} {...props}>
    {trigger => <button {...trigger}>Actions</button>}
  </adapters.DropdownAdapter><button>Outside</button></StrictMode>);
}
it('opens a named menu, runs an action once and restores trigger focus on selection', async () => {
  const user = userEvent.setup(), action = vi.fn(); example({ onAction: action });
  const trigger = screen.getByRole('button', { name: 'Actions' });
  await user.click(trigger);
  const menu = screen.getByRole('menu', { name: 'Actions' });
  expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
  expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
  await user.click(screen.getByRole('menuitem', { name: 'Save' }));
  expect(action).toHaveBeenCalledExactlyOnceWith('save');
  expect(screen.queryByRole('menu')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
it.each([['ArrowDown', 'Edit'], ['ArrowUp', 'Save']])('opens with %s and focuses %s', (key, label) => {
  example(); fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key });
  expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: label }));
  fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: label === 'Edit' ? 'Save' : 'Edit' }));
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('menu')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Actions' }));
});
it.each(['{Enter}', ' '])('uses native %s activation and never submits the surrounding form', async key => {
  expect(typeof adapters.DropdownAdapter).toBe('function');
  const user = userEvent.setup(), submit = vi.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><adapters.DropdownAdapter items={items}>
    {trigger => <button {...trigger}>Actions</button>}
  </adapters.DropdownAdapter></form>);
  screen.getByRole('button').focus(); await user.keyboard(key);
  expect(screen.getByRole('menu')).toBeTruthy(); expect(submit).not.toHaveBeenCalled();
});
it('keeps disabled actions inert and lets Tab or outside clicks leave without stealing focus', async () => {
  const user = userEvent.setup(), action = vi.fn(); example({ onAction: action });
  const trigger = screen.getByRole('button', { name: 'Actions' });
  await user.click(trigger); await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
  expect(action).not.toHaveBeenCalled(); expect(screen.getByRole('menu')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Outside' }));
  expect(screen.queryByRole('menu')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
  await user.click(trigger); await user.tab();
  expect(screen.queryByRole('menu')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
});
it('preserves controlled ownership when opening or selection requests are refused', () => {
  const change = vi.fn(), action = vi.fn();
  const { rerender } = example({ open: false, onOpenChange: change, onAction: action });
  fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
  expect(change).toHaveBeenLastCalledWith(true); expect(screen.queryByRole('menu')).toBeNull();
  rerender(<adapters.DropdownAdapter items={items} open onOpenChange={change} onAction={action}>
    {trigger => <button {...trigger}>Actions</button>}
  </adapters.DropdownAdapter>);
  fireEvent.click(screen.getByRole('menuitem', { name: 'Save' }));
  expect(change).toHaveBeenLastCalledWith(false); expect(screen.getByRole('menu')).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Save' }));
});
it('forwards popup and menu properties, positioning and optional arrow without leaking component options', () => {
  example({ defaultOpen: true, placement: 'bottomRight', arrow: true, autoAdjustOverflow: false,
    'aria-label': 'File actions', className: 'popup', style: { color: 'red' },
    menuProps: { className: 'menu', slotProps: { item: { className: 'item' } } } });
  const menu = screen.getByRole('menu', { name: 'File actions' });
  expect(menu.className).toBe('menu'); expect(screen.getByRole('menuitem', { name: 'Edit' }).className).toBe('item');
  const popup = menu.parentElement!;
  expect(popup.className).toBe('popup'); expect(popup.style.color).toBe('red');
  expect(popup.getAttribute('data-placement')).toBe('bottomRight');
  expect(popup.querySelector('[data-ui="popover-arrow"]')).toBeTruthy();
  expect(popup.hasAttribute('placement')).toBe(false);
  expect(popup.hasAttribute('items')).toBe(false);
});
it('does not open while disabled or for composing or prevented arrow events', () => {
  const { rerender } = example({ disabled: true }); const trigger = screen.getByRole('button', { name: 'Actions' });
  fireEvent.click(trigger); fireEvent.keyDown(trigger, { key: 'ArrowDown' }); expect(screen.queryByRole('menu')).toBeNull();
  rerender(<adapters.DropdownAdapter items={items}>{trigger => <button {...trigger}>Actions</button>}</adapters.DropdownAdapter>);
  const enabled = screen.getByRole('button', { name: 'Actions' });
  fireEvent.keyDown(enabled, { key: 'ArrowUp', isComposing: true }); expect(screen.queryByRole('menu')).toBeNull();
  const cancelled = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
  cancelled.preventDefault(); fireEvent(enabled, cancelled); expect(screen.queryByRole('menu')).toBeNull();
});
it('forgets a refused ArrowUp request when the next opening is a click', () => {
  const { rerender } = example({ open: false });
  fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowUp' });
  fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
  rerender(<StrictMode><adapters.DropdownAdapter items={items} open>
    {trigger => <button {...trigger}>Actions</button>}
  </adapters.DropdownAdapter><button>Outside</button></StrictMode>);
  expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
});
it.each([{ entries: [] }, { entries: [{ value: 'delete', label: 'Delete', disabled: true }] }])('focuses an empty or fully disabled menu so Escape still has an accessible target', ({ entries }) => {
  example({ items: entries }); fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
  expect(document.activeElement).toBe(screen.getByRole('menu'));
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' }); expect(screen.queryByRole('menu')).toBeNull();
});
it('honors prevented item actions without closing or invoking onAction', () => {
  const action = vi.fn(); example({ onAction: action, menuProps: { slotProps: { item: { onClick: (event: React.MouseEvent) => event.preventDefault() } } } });
  fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
  expect(action).not.toHaveBeenCalled(); expect(screen.getByRole('menu')).toBeTruthy();
});
it('starts ArrowDown at the first item even when a later item is selected, but click focuses the selection', () => {
  example({ selectedValue: 'save' }); const trigger = screen.getByRole('button', { name: 'Actions' });
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'Edit' }));
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  fireEvent.click(trigger);
  expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'Save' }));
});
it.each(['ArrowUp', 'click'])('reveals an initially focused item inside the menu scroll container (%s)', activation => {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function () {
    return this.getAttribute('role') === 'menu' ? 80 : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    const top = this.getAttribute('data-menu-value') === 'save' ? 150 : 0;
    return { x: 0, y: top, left: 0, right: 100, width: 100, height: this.getAttribute('role') === 'menu' ? 80 : 30,
      top, bottom: this.getAttribute('role') === 'menu' ? 80 : top + 30, toJSON() {} };
  });
  example({ selectedValue: 'save' }); const trigger = screen.getByRole('button', { name: 'Actions' });
  if (activation === 'click') fireEvent.click(trigger); else fireEvent.keyDown(trigger, { key: activation });
  expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'Save' }));
  expect(screen.getByRole('menu').scrollTop).toBe(100);
});
