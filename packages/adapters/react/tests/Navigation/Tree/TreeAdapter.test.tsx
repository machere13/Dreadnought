import { createRef, StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { act, cleanup, createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { TreeAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);
type Node = { id: string | number; label: string; children?: readonly Node[] };
const records: readonly Node[] = [
  { id: 0, label: 'Root', children: [
    { id: 1, label: 'Branch', children: [{ id: '', label: 'Leaf' }] },
    { id: '1', label: 'Sibling' },
  ] }, { id: 'end', label: 'End' },
];
const props = { records, getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children, getLabel: (node: Node) => node.label };
const item = (name: string) => screen.getByRole('treeitem', { name });
const focus = (node: HTMLElement) => act(() => node.focus());

it('nests groups, separates names and keeps one tab stop', async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLUListElement>();
  render(<><button>Before</button><TreeAdapter {...props} ref={ref} id="tree" aria-label="Files"
    defaultExpandedKeys={[0, 1]} /><button>After</button></>);
  expect(ref.current).toBe(screen.getByRole('tree', { name: 'Files' }));
  expect(item('Root').querySelector('[role="group"]')?.contains(item('Branch'))).toBe(true);
  expect(item('Branch').querySelector('[role="group"]')?.contains(item('Leaf'))).toBe(true);
  expect(item('Leaf').hasAttribute('aria-expanded')).toBe(false);
  expect(item('Leaf').getAttribute('aria-level')).toBe('3');
  expect(screen.getAllByRole('treeitem').map(node => node.getAttribute('aria-label'))).toEqual(['Root', 'Branch', 'Leaf', 'Sibling', 'End']);
  expect(screen.getAllByRole('treeitem').filter(node => node.tabIndex === 0)).toHaveLength(1);
  expect(screen.getAllByRole('treeitem').every(node => !node.hasAttribute('aria-selected') && !node.hasAttribute('aria-checked'))).toBe(true);
  await user.tab(); await user.tab();
  expect(document.activeElement).toBe(item('Root'));
  await user.keyboard('{ArrowDown}{ArrowRight}');
  expect(document.activeElement).toBe(item('Leaf'));
  await user.tab(); expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  await user.tab({ shift: true }); expect(document.activeElement).toBe(item('Leaf'));
});

it('repairs focus only after controlled collapse is accepted', () => {
  const changed = vi.fn();
  const view = render(<TreeAdapter {...props} expandedKeys={[0, 1]} onExpandedKeysChange={changed} />);
  focus(item('Leaf'));
  fireEvent.keyDown(item('Branch'), { key: 'ArrowLeft' });
  expect(changed).toHaveBeenCalledExactlyOnceWith([0]);
  expect(document.activeElement).toBe(item('Leaf'));
  view.rerender(<TreeAdapter {...props} expandedKeys={[0]} onExpandedKeysChange={changed} />);
  expect(document.activeElement).toBe(item('Branch'));
});

it('does not toggle ancestors when a child is clicked', () => {
  const changed = vi.fn();
  render(<TreeAdapter {...props} defaultExpandedKeys={[0, 1]} onExpandedKeysChange={changed} />);
  fireEvent.click(item('Leaf').querySelector('[data-slot="tree-content"]')!);
  expect(document.activeElement).toBe(item('Leaf'));
  expect(changed).not.toHaveBeenCalled();
  fireEvent.click(item('Branch').querySelector('[data-slot="tree-content"]')!);
  expect(changed).toHaveBeenCalledExactlyOnceWith([0]);
});

it.each([
  { ctrlKey: true }, { altKey: true }, { metaKey: true }, { shiftKey: true }, { isComposing: true },
])('leaves modified/composing events alone: %j', flags => {
  const changed = vi.fn();
  render(<TreeAdapter {...props} onExpandedKeysChange={changed} />);
  const event = createEvent.keyDown(item('Root'), { key: 'ArrowRight', ...flags });
  fireEvent(item('Root'), event);
  expect(changed).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(false);
});

it.each(['ancestor', 'first', 'empty', 'external'] as const)('repairs removal: %s', mode => {
  const view = render(<><TreeAdapter {...props} defaultExpandedKeys={[0, 1]} /><button>Outside</button></>);
  focus(item('Leaf'));
  if (mode === 'external') focus(screen.getByRole('button', { name: 'Outside' }));
  const next = mode === 'ancestor' ? [{ id: 0, label: 'Root' }]
    : mode === 'empty' ? [] : [{ id: 'end', label: 'End' }];
  view.rerender(<><TreeAdapter {...props} records={next} /><button>Outside</button></>);
  expect(document.activeElement).toBe(mode === 'external' ? screen.getByRole('button', { name: 'Outside' })
    : mode === 'empty' ? screen.getByRole('tree') : item(mode === 'ancestor' ? 'Root' : 'End'));
});

it('uses the owner document when a focused item is removed inside an iframe', () => {
  const frame = document.createElement('iframe'); document.body.append(frame);
  const host = frame.contentDocument!.createElement('div'); frame.contentDocument!.body.append(host);
  const view = render(<TreeAdapter {...props} defaultExpandedKeys={[0, 1]} />, { container: host });
  focus(within(host).getByRole('treeitem', { name: 'Leaf' }));
  view.rerender(<TreeAdapter {...props} records={[]} />);
  expect(frame.contentDocument!.activeElement).toBe(within(host).getByRole('tree'));
  view.unmount(); frame.remove();
});

it.each(['click', 'keydown'] as const)('respects user cancellation: %s', kind => {
  const changed = vi.fn();
  const cancel = vi.fn((event: { preventDefault(): void }) => event.preventDefault());
  render(<TreeAdapter {...props} onExpandedKeysChange={changed}
    onClick={kind === 'click' ? cancel : undefined} onKeyDown={kind === 'keydown' ? cancel : undefined} />);
  if (kind === 'click') fireEvent.click(item('Root').querySelector('[data-slot="tree-content"]')!);
  else fireEvent.keyDown(item('Root'), { key: 'ArrowRight' });
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(changed).not.toHaveBeenCalled();
});

it('prevents navigation scroll and branch submit but leaves leaf Enter alone', async () => {
  const user = userEvent.setup();
  const submitted = vi.fn(event => event.preventDefault());
  render(<form onSubmit={submitted}><TreeAdapter {...props} defaultExpandedKeys={[0]} /></form>);
  focus(item('Root'));
  const boundary = createEvent.keyDown(item('Root'), { key: 'ArrowUp' });
  fireEvent(item('Root'), boundary); expect(boundary.defaultPrevented).toBe(true);
  await user.keyboard('{Enter} ');
  expect(item('Root').getAttribute('aria-expanded')).toBe('true');
  const leaf = createEvent.keyDown(item('Sibling'), { key: 'Enter' });
  fireEvent(item('Sibling'), leaf); expect(leaf.defaultPrevented).toBe(false);
  expect(submitted).not.toHaveBeenCalled();
});

it('forwards root and slot props while disabled interaction stays inert', () => {
  const changed = vi.fn();
  render(<><span id="tree-label">Files</span><TreeAdapter {...props} disabled
    aria-labelledby="tree-label" className="root-class" data-test="forwarded" style={{ color: 'red' }}
    defaultExpandedKeys={[0]} onExpandedKeysChange={changed}
    slotClassNames={{ item: 'item-class', content: 'content-class', group: 'group-class', indicator: 'indicator-class' }} /></>);
  const root = screen.getByRole('tree', { name: 'Files' });
  expect(root.className).toBe('root-class'); expect(root.getAttribute('data-test')).toBe('forwarded');
  expect(root.style.color).toBe('red'); expect(root.getAttribute('aria-disabled')).toBe('true');
  for (const [slot, className] of [['tree-item', 'item-class'], ['tree-content', 'content-class'],
    ['tree-group', 'group-class'], ['tree-indicator', 'indicator-class']] as const)
    expect(root.querySelector(`[data-slot="${slot}"]`)?.className).toBe(className);
  focus(item('Root')); fireEvent.keyDown(item('Root'), { key: 'ArrowLeft' });
  fireEvent.click(item('Root').querySelector('[data-slot="tree-content"]')!);
  expect(document.activeElement).toBe(item('Root')); expect(changed).not.toHaveBeenCalled();
});

it('ignores interactive and nested-tree descendants', () => {
  const changed = vi.fn();
  render(<TreeAdapter {...props} onExpandedKeysChange={changed} renderLabel={row => row.key === 0
    ? <><button>Inner action</button><input aria-label="Inner input" />
      <TreeAdapter {...props} records={[{ id: 'inner', label: 'Inner root', children: [{ id: 'child', label: 'Inner child' }] }]} /></>
    : <strong>{row.record.label}</strong>} />);
  const button = screen.getByRole('button', { name: 'Inner action' });
  focus(button); fireEvent.click(button); fireEvent.keyDown(button, { key: 'ArrowRight' });
  const input = screen.getByRole('textbox', { name: 'Inner input' });
  focus(input); fireEvent.keyDown(input, { key: 'ArrowRight' });
  fireEvent.keyDown(item('Inner root'), { key: 'ArrowRight' });
  expect(item('Inner child')).toBeTruthy(); expect(changed).not.toHaveBeenCalled();
});

it('keeps focus and tab stop correct in StrictMode and after reordering', () => {
  const view = render(<StrictMode><TreeAdapter {...props} defaultExpandedKeys={[0, 1]} /></StrictMode>);
  focus(item('Sibling'));
  view.rerender(<StrictMode><TreeAdapter {...props} records={[records[1], records[0]]} /></StrictMode>);
  expect(document.activeElement).toBe(item('Sibling'));
  expect(item('Sibling').tabIndex).toBe(0);
  fireEvent.keyDown(item('Sibling'), { key: 'Home' });
  expect(document.activeElement).toBe(item('End'));
});

it('leaves an empty tree tabbable and ignores unrelated keys', async () => {
  const user = userEvent.setup();
  render(<><TreeAdapter {...props} records={[]} /><button>After</button></>);
  const root = screen.getByRole('tree', { name: 'Дерево' });
  await user.tab(); expect(document.activeElement).toBe(root);
  await user.tab(); expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
});

it('remembers the visible ancestor across unrelated renders without stealing external focus', () => {
  const view = render(<><TreeAdapter {...props} expandedKeys={[0, 1]} /><button>Outside</button></>);
  focus(item('Leaf'));
  const outside = screen.getByRole('button', { name: 'Outside' });
  focus(outside);
  view.rerender(<><TreeAdapter {...props} expandedKeys={[0]} /><button>Outside</button></>);
  expect(item('Branch').tabIndex).toBe(0);
  view.rerender(<><TreeAdapter {...props} expandedKeys={[0]} data-version="next" /><button>Outside</button></>);
  expect(item('Branch').tabIndex).toBe(0);
  expect(document.activeElement).toBe(outside);
});

it('restores focus to the same key when reparenting replaces its element', () => {
  const leaf = { id: 'leaf', label: 'Moved leaf' };
  const view = render(<TreeAdapter {...props} defaultExpandedKeys={['a', 'b']}
    records={[{ id: 'a', label: 'A', children: [leaf] }, { id: 'b', label: 'B' }]} />);
  const previous = item('Moved leaf');
  focus(previous);
  view.rerender(<TreeAdapter {...props} defaultExpandedKeys={['a', 'b']}
    records={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B', children: [leaf] }]} />);
  expect(previous.isConnected).toBe(false);
  expect(document.activeElement).toBe(item('Moved leaf'));
  fireEvent.keyDown(item('Moved leaf'), { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(item('B'));
});

it.each(['click', 'keydown'] as const)('keeps item identity across synchronous consumer reorder: %s', kind => {
  const changed = vi.fn();
  const branches: Node[] = ['A', 'B'].map(label => ({ id: label, label, children: [{ id: `${label}-child`, label: `${label} child` }] }));
  function Example() {
    const [nodes, setNodes] = useState(branches);
    const reorder = () => flushSync(() => setNodes([branches[1], branches[0]]));
    return <TreeAdapter {...props} records={nodes} onExpandedKeysChange={changed}
      onClick={kind === 'click' ? reorder : undefined} onKeyDown={kind === 'keydown' ? reorder : undefined} />;
  }
  render(<Example />);
  focus(item('A'));
  if (kind === 'click') fireEvent.click(item('A').querySelector('[data-slot="tree-content"]')!);
  else fireEvent.keyDown(item('A'), { key: 'ArrowRight' });
  expect(changed).toHaveBeenCalledExactlyOnceWith(['A']);
  expect(document.activeElement).toBe(item('A'));
  expect(item('A').getAttribute('aria-expanded')).toBe('true');
  expect(item('B').getAttribute('aria-expanded')).toBe('false');
});

it.each(['click', 'keydown'] as const)('ignores an item removed by the consumer callback: %s', kind => {
  const changed = vi.fn();
  function Example() {
    const [nodes, setNodes] = useState(records);
    const remove = () => flushSync(() => setNodes([records[1]]));
    return <TreeAdapter {...props} records={nodes} onExpandedKeysChange={changed}
      onClick={kind === 'click' ? remove : undefined} onKeyDown={kind === 'keydown' ? remove : undefined} />;
  }
  render(<Example />);
  focus(item('Root'));
  if (kind === 'click') fireEvent.click(item('Root').querySelector('[data-slot="tree-content"]')!);
  else fireEvent.keyDown(item('Root'), { key: 'ArrowRight' });
  expect(changed).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(item('End'));
});

it('keeps the focused key when focus capture synchronously reorders records', () => {
  function Example() {
    const [nodes, setNodes] = useState(records);
    return <TreeAdapter {...props} records={nodes}
      onFocusCapture={() => flushSync(() => setNodes([records[1], records[0]]))} />;
  }
  render(<Example />);
  focus(item('Root'));
  expect(item('Root').tabIndex).toBe(0);
  expect(item('End').tabIndex).toBe(-1);
});
