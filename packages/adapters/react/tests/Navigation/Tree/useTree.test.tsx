import { StrictMode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useTree } from '@dreadnought/react/logic';

afterEach(cleanup);
type Node = { id: string; children?: readonly Node[] };
const records: readonly Node[] = [{ id: 'a', children: [{ id: 'b', children: [{ id: 'leaf' }] }] }];
const base = {
  records,
  getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children,
};

it('accumulates rapid uncontrolled requests once each under StrictMode', () => {
  const changed = vi.fn();
  const view = renderHook(() => useTree({ ...base, onExpandedKeysChange: changed }), {
    wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
  });
  act(() => {
    view.result.current.toggle('a');
    view.result.current.toggle('a');
    view.result.current.toggle('a');
  });
  expect(view.result.current.expandedKeys).toEqual(['a']);
  expect(changed.mock.calls).toEqual([[['a']], [[]], [['a']]]);
  act(() => view.result.current.toggle('b'));
  act(() => view.result.current.toggle('a'));
  expect(view.result.current.expandedKeys).toEqual(['b']);
  act(() => view.result.current.toggle('a'));
  expect(view.result.current.rows.map((row) => row.key)).toEqual(['a', 'b', 'leaf']);
});

it('keeps controlled requests owner-based and does not notify on props', () => {
  const changed = vi.fn();
  const view = renderHook(
    ({ expandedKeys }: { expandedKeys: readonly string[] }) =>
      useTree({ ...base, expandedKeys, onExpandedKeysChange: changed }),
    { initialProps: { expandedKeys: [] as readonly string[] } },
  );
  act(() => {
    view.result.current.toggle('a');
    view.result.current.toggle('a');
  });
  expect(changed.mock.calls).toEqual([[['a']], [['a']]]);
  expect(view.result.current.rows).toHaveLength(1);
  view.rerender({ expandedKeys: ['a'] });
  expect(changed).toHaveBeenCalledTimes(2);
  expect(view.result.current.rows).toHaveLength(2);
});

it('suppresses invalid/no-op changes and retains missing keys', () => {
  const changed = vi.fn();
  const initial = Object.freeze(['a', 'b', 'missing']);
  const view = renderHook(
    ({ records, disabled }: { records: readonly Node[]; disabled: boolean }) =>
      useTree({
        ...base,
        records,
        disabled,
        defaultExpandedKeys: initial,
        onExpandedKeysChange: changed,
      }),
    { initialProps: { records, disabled: false } },
  );
  act(() => {
    view.result.current.toggle('leaf');
    view.result.current.toggle('unknown');
    view.result.current.setExpanded('a', true);
  });
  expect(changed).not.toHaveBeenCalled();
  view.rerender({ records: [], disabled: false });
  expect(view.result.current.expandedKeys).toEqual(initial);
  view.rerender({ records, disabled: true });
  act(() => view.result.current.toggle('a'));
  expect(changed).not.toHaveBeenCalled();
  view.rerender({ records, disabled: false });
  act(() => view.result.current.setExpanded('a', false));
  act(() => view.result.current.toggle('b'));
  expect(changed).toHaveBeenCalledExactlyOnceWith(['b', 'missing']);
  expect(initial).toEqual(['a', 'b', 'missing']);
});

it('allows a child revealed by an earlier request in the same batch', () => {
  const view = renderHook(() => useTree(base));
  act(() => {
    view.result.current.toggle('a');
    view.result.current.toggle('b');
  });
  expect(view.result.current.expandedKeys).toEqual(['a', 'b']);
  expect(view.result.current.rows.map((row) => row.key)).toEqual(['a', 'b', 'leaf']);
});
