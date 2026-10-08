import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TreeAdapter } from '@dreadnought/react/unstyled';
import { Tree } from '@dreadnought/ui/react';
import { treePresentation } from '@dreadnought/ui';

afterEach(cleanup);
type Node = { id: number; label: string; children?: readonly Node[] };
const props = { records: [{ id: 0, label: 'Root', children: [{ id: 1, label: 'Leaf' }] }],
  getKey: (node: Node) => node.id, getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label };

it('uses the shared Ant Design icon for branches, not text triangles', () => {
  render(<Tree {...props} />);
  const branch = screen.getByRole('treeitem', { name: 'Root' });
  const indicator = branch.querySelector('[data-slot="tree-indicator"]')!;
  expect(indicator.querySelector('svg[data-icon="down"]')).not.toBeNull();
  expect(indicator.textContent).toBe('');
  fireEvent.click(indicator.querySelector('svg')!);
  expect(branch.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('treeitem', { name: 'Leaf' }).querySelector('[data-slot="tree-indicator"]')).toBeNull();
});

it('reuses themed Checkbox and forwards selection and checking without conflating expansion', () => {
  render(<Tree {...props} selectable checkable defaultExpandedKeys={[0]} defaultCheckedKeys={[1]} />);
  const leaf = screen.getByRole('treeitem', { name: 'Leaf' });
  const control = screen.getByRole('checkbox', { name: 'Leaf' });
  expect(control.closest('[data-ui="checkbox"]')?.className).not.toBe('');
  expect(control.closest('[data-ui="checkbox"]')?.querySelector('svg[data-icon="check"]')).not.toBeNull();
  fireEvent.click(leaf.querySelector('[data-slot="tree-content"]')!);
  expect(leaf.getAttribute('aria-selected')).toBe('true');
  expect(leaf.getAttribute('aria-checked')).toBe('true');
  fireEvent.click(control);
  expect(leaf.getAttribute('aria-checked')).toBe('false');
  expect(leaf.getAttribute('aria-selected')).toBe('true');
  expect(screen.getByRole('treeitem', { name: 'Root' }).getAttribute('aria-expanded')).toBe('true');
});

it('merges all presentation slots without changing generic records, refs or custom labels', () => {
  const ref = createRef<HTMLUListElement>();
  render(<><Tree {...props} ref={ref} aria-label="Ready" className="own-root" id="files"
    defaultExpandedKeys={[0]} renderLabel={row => <strong>{row.record.label}</strong>}
    slotClassNames={{ item: 'own-item', content: 'own-content', group: 'own-group', indicator: 'own-indicator' }} />
    <TreeAdapter {...props} aria-label="Plain" /></>);
  const root = screen.getByRole('tree', { name: 'Ready' });
  expect(ref.current).toBe(root);
  expect(root.id).toBe('files');
  expect(root.className).toContain('own-root');
  expect(root.className).toContain(treePresentation.root);
  for (const slot of ['item', 'content', 'group', 'indicator'] as const) {
    const node = root.querySelector(`[data-slot="tree-${slot}"]`)!;
    expect(node.className).toContain(`own-${slot}`);
    expect(node.className).toContain(treePresentation[slot]);
  }
  expect(screen.getByRole('treeitem', { name: 'Leaf' }).querySelector('strong')?.textContent).toBe('Leaf');
  expect(screen.getByRole('tree', { name: 'Plain' }).className).toBe('');
});

it('preserves controlled expansion and disabled interaction through the ready facade', () => {
  const changed = vi.fn();
  const view = render(<Tree {...props} expandedKeys={[]} onExpandedKeysChange={changed} />);
  fireEvent.keyDown(screen.getByRole('treeitem', { name: 'Root' }), { key: 'ArrowRight' });
  expect(changed).toHaveBeenCalledExactlyOnceWith([0]);
  expect(screen.queryByRole('treeitem', { name: 'Leaf' })).toBeNull();
  view.rerender(<Tree {...props} expandedKeys={[0]} onExpandedKeysChange={changed} disabled />);
  expect(screen.getByRole('treeitem', { name: 'Leaf' })).toBeTruthy();
  fireEvent.click(screen.getByRole('treeitem', { name: 'Root' }).querySelector('[data-slot="tree-content"]')!);
  expect(changed).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('tree').getAttribute('aria-disabled')).toBe('true');
});
