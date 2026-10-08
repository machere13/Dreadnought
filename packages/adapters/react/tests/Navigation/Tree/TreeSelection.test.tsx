import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TreeAdapter } from '@dreadnought/react/unstyled';
import { useTree } from '@dreadnought/react/logic';

afterEach(cleanup);
type Node = { id: string; label: string; disabled?: boolean; children?: readonly Node[] };
const records: readonly Node[] = [{ id: 'root', label: 'Root', children: [
  { id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'locked', label: 'Locked', disabled: true },
] }];
const base = { records, getKey: (node: Node) => node.id, getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label, getDisabled: (node: Node) => Boolean(node.disabled) };
const item = (name: string) => screen.getByRole('treeitem', { name });
const content = (name: string) => item(name).querySelector('[data-slot="tree-content"]')!;

it('keeps selection separate from expansion and checking', () => {
  render(<TreeAdapter {...base} selectable checkable />);
  fireEvent.click(content('Root'));
  expect(item('Root').getAttribute('aria-selected')).toBe('true');
  expect(item('Root').getAttribute('aria-expanded')).toBe('false');
  expect(item('Root').getAttribute('aria-checked')).toBe('false');
  fireEvent.click(item('Root').querySelector('[data-slot="tree-indicator"]')!);
  fireEvent.keyDown(item('A'), { key: ' ' });
  expect(item('A').getAttribute('aria-checked')).toBe('true');
  expect(item('Root').getAttribute('aria-checked')).toBe('mixed');
  expect(item('Root').getAttribute('aria-selected')).toBe('true');
  fireEvent.keyDown(item('B'), { key: 'Enter' });
  expect(item('B').getAttribute('aria-selected')).toBe('true');
  expect(item('Root').getAttribute('aria-selected')).toBe('false');
});

it('uses checkboxes without extra tab stops and ignores disabled checks', () => {
  render(<TreeAdapter {...base} checkable defaultExpandedKeys={['root']} />);
  const control = screen.getByRole('checkbox', { name: 'A' });
  expect(control.tabIndex).toBe(-1);
  fireEvent.click(control);
  expect(item('A').getAttribute('aria-checked')).toBe('true');
  expect((screen.getByRole('checkbox', { name: 'Root' }) as HTMLInputElement).indeterminate).toBe(true);
  expect(screen.getByRole('checkbox', { name: 'Locked' }).hasAttribute('disabled')).toBe(true);
  fireEvent.keyDown(item('Locked'), { key: ' ' });
  expect(item('Locked').getAttribute('aria-checked')).toBe('false');
});

it('keeps controlled requests owner-based and does not notify on props', () => {
  const selected = vi.fn(), checked = vi.fn();
  const view = render(<TreeAdapter {...base} selectable checkable selectedKeys={[]} checkedKeys={[]}
    onSelectedKeysChange={selected} onCheckedKeysChange={checked} />);
  fireEvent.click(content('Root')); fireEvent.keyDown(item('Root'), { key: ' ' });
  expect(item('Root').getAttribute('aria-selected')).toBe('false');
  expect(item('Root').getAttribute('aria-checked')).toBe('false');
  expect(selected).toHaveBeenCalledExactlyOnceWith(['root']);
  expect(checked).toHaveBeenCalledExactlyOnceWith(['root', 'a', 'b'], []);
  view.rerender(<TreeAdapter {...base} selectable checkable selectedKeys={['root']} checkedKeys={['a']}
    onSelectedKeysChange={selected} onCheckedKeysChange={checked} />);
  expect(item('Root').getAttribute('aria-selected')).toBe('true');
  expect(item('Root').getAttribute('aria-checked')).toBe('mixed');
  expect(checked).toHaveBeenCalledTimes(1); expect(selected).toHaveBeenCalledTimes(1);
});

it('accumulates batched multiple selections and checks under StrictMode', () => {
  const view = renderHook(() => useTree({ ...base, selectable: true, multiple: true, checkable: true,
    defaultExpandedKeys: ['root'] }), { wrapper: ({ children }) => <StrictMode>{children}</StrictMode> });
  act(() => { view.result.current.select('a'); view.result.current.select('b');
    view.result.current.setChecked('a', true); view.result.current.setChecked('b', true); });
  expect(view.result.current.selectedKeys).toEqual(['a', 'b']);
  expect(view.result.current.checkedKeys).toEqual(['root', 'a', 'b']);
  act(() => view.result.current.setChecked('a', false));
  expect(view.result.current.checkedKeys).toEqual(['b']);
  expect(view.result.current.halfCheckedKeys).toEqual(['root']);
});

it('supports independent checks and per-node selection guards', () => {
  render(<TreeAdapter {...base} checkable checkStrictly selectable getSelectable={node => node.id !== 'a'}
    defaultExpandedKeys={['root']} />);
  fireEvent.keyDown(item('Root'), { key: ' ' });
  expect(item('Root').getAttribute('aria-checked')).toBe('true');
  expect(item('A').getAttribute('aria-checked')).toBe('false');
  fireEvent.click(content('A')); fireEvent.click(content('Locked'));
  expect(item('A').hasAttribute('aria-selected')).toBe(false);
  expect(item('Locked').getAttribute('aria-selected')).toBe('false');
});

it('honors cancelled checkbox clicks before changing state', () => {
  render(<TreeAdapter {...base} checkable onClick={event => event.preventDefault()} />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Root' }));
  expect(item('Root').getAttribute('aria-checked')).toBe('false');
});
