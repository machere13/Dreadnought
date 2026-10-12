import { StrictMode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useTreeSelect } from '../../../src/logic.ts';

afterEach(cleanup);
type Node = { id: string; label: string; children?: readonly Node[]; disabled?: boolean };
const records: readonly Node[] = [
  {
    id: 'dev',
    label: 'Разработка',
    children: [
      { id: 'front', label: 'Frontend' },
      { id: 'back', label: 'Backend' },
    ],
  },
];
const options = {
  records,
  getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label,
};

it('checks and removes the complete branch while search hides a child', () => {
  const onValueChange = vi.fn();
  const { result } = renderHook(() =>
    useTreeSelect({ ...options, multiple: true, showSearch: true, onValueChange }),
  );
  act(() => result.current.setSearch('front'));
  act(() => result.current.check('dev', true));
  expect(result.current.value).toEqual(['dev', 'front', 'back']);
  expect(result.current.rows.map((row) => row.key)).toEqual(['dev', 'front']);
  expect(result.current.tags.map((tag) => tag.key)).toEqual(['dev']);
  act(() => result.current.remove('dev'));
  expect(result.current.value).toEqual([]);
  expect(onValueChange).toHaveBeenLastCalledWith([]);
});

it('starts the next controlled action from accepted rather than rejected keys', () => {
  const onValueChange = vi.fn();
  const { result } = renderHook(() =>
    useTreeSelect({ ...options, multiple: true, value: ['front'], onValueChange }),
  );
  act(() => result.current.check('back', true));
  expect(onValueChange).toHaveBeenLastCalledWith(['dev', 'front', 'back']);
  expect(result.current.value).toEqual(['front']);
  act(() => result.current.remove('front'));
  expect(onValueChange).toHaveBeenLastCalledWith([]);
  expect(result.current.value).toEqual(['front']);
});

it('keeps strict checking independent and exposes partial linked marks', () => {
  const { result } = renderHook(() =>
    useTreeSelect({ ...options, multiple: true, checkStrictly: true }),
  );
  act(() => result.current.check('dev', true));
  act(() => result.current.check('front', true));
  expect(result.current.value).toEqual(['dev', 'front']);
  expect(result.current.tags.map((tag) => tag.key)).toEqual(['dev', 'front']);
  const linked = renderHook(() =>
    useTreeSelect({ ...options, multiple: true, defaultValue: ['front'] }),
  );
  expect(linked.result.current.halfCheckedKeys).toEqual(['dev']);
  expect(linked.result.current.tags.map((tag) => tag.key)).toEqual(['front']);
});

it('preserves unknown values and restores labels when records return', () => {
  const onValueChange = vi.fn();
  const { result, rerender } = renderHook(
    ({ data }) =>
      useTreeSelect({
        ...options,
        records: data,
        value: 'front',
        onValueChange,
      }),
    { initialProps: { data: records } },
  );
  rerender({ data: [] });
  expect(result.current.value).toBe('front');
  expect(result.current.tags[0]).toMatchObject({ key: 'front', label: 'front', record: undefined });
  rerender({ data: records });
  expect(result.current.tags[0].label).toBe('Frontend');
  expect(onValueChange).not.toHaveBeenCalled();
});

it('selects numeric zero once and closes without toggling it off', () => {
  const onValueChange = vi.fn();
  const { result } = renderHook(() =>
    useTreeSelect({
      records: [{ id: 0, label: 'Zero' }],
      getKey: (node) => node.id,
      getChildren: () => [],
      getLabel: (node) => node.label,
      onValueChange,
    }),
  );
  act(() => {
    result.current.setOpen(true);
    result.current.select(0);
  });
  expect(result.current.value).toBe(0);
  expect(result.current.open).toBe(false);
  act(() => result.current.select(0));
  expect(result.current.value).toBe(0);
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

it('keeps search expansion temporary and restores user disclosure on clearing', () => {
  const onExpandedKeysChange = vi.fn();
  const { result } = renderHook(() =>
    useTreeSelect({ ...options, showSearch: true, onExpandedKeysChange }),
  );
  act(() => result.current.setSearch('front'));
  expect(result.current.expandedKeys).toEqual(['dev']);
  expect(onExpandedKeysChange).not.toHaveBeenCalled();
  act(() => result.current.setExpanded('dev', false));
  expect(result.current.rows.map((row) => row.key)).toEqual(['dev']);
  act(() => result.current.setSearch(''));
  expect(result.current.expandedKeys).toEqual([]);
  expect(onExpandedKeysChange).not.toHaveBeenCalled();
  act(() => result.current.setExpanded('dev', true));
  expect(onExpandedKeysChange).toHaveBeenLastCalledWith(['dev']);
});

it('does not leak a rejected controlled search proposal into the projection', () => {
  const onSearch = vi.fn();
  const { result } = renderHook(() =>
    useTreeSelect({ ...options, showSearch: { searchValue: 'front', onSearch } }),
  );
  act(() => result.current.setSearch('back'));
  expect(onSearch).toHaveBeenCalledWith('back');
  expect(result.current.searchValue).toBe('front');
  expect(result.current.rows.map((row) => row.key)).toEqual(['dev', 'front']);
});

it('respects disabled checking boundaries and separate selectable guards', () => {
  const data: readonly Node[] = [
    {
      id: 'dev',
      label: 'Dev',
      children: [
        { id: 'front', label: 'Front' },
        { id: 'back', label: 'Back', disabled: true },
      ],
    },
  ];
  const { result } = renderHook(() =>
    useTreeSelect({
      ...options,
      records: data,
      multiple: true,
      getCheckDisabled: (node) => Boolean(node.disabled),
    }),
  );
  act(() => result.current.check('dev', true));
  expect(result.current.value).toEqual(['dev', 'front']);
  act(() => result.current.check('back', true));
  expect(result.current.value).toEqual(['dev', 'front']);
  const single = renderHook(() =>
    useTreeSelect({ ...options, getSelectable: (node) => node.id !== 'dev' }),
  );
  act(() => single.result.current.select('dev'));
  expect(single.result.current.value).toBeNull();
});

it.each(['readOnly', 'disabled'] as const)('blocks value mutations when %s', (flag) => {
  const onValueChange = vi.fn();
  const { result } = renderHook(() =>
    useTreeSelect({
      ...options,
      multiple: true,
      defaultValue: ['front'],
      [flag]: true,
      onValueChange,
    }),
  );
  act(() => {
    result.current.check('back', true);
    result.current.remove('front');
    result.current.clear();
  });
  expect(result.current.value).toEqual(['front']);
  expect(onValueChange).not.toHaveBeenCalled();
  act(() => result.current.setOpen(true));
  expect(result.current.open).toBe(flag === 'readOnly');
  act(() => result.current.setExpanded('dev', true));
  expect(result.current.expandedKeys).toEqual(flag === 'readOnly' ? ['dev'] : []);
});

it('keeps consecutive actions, resets defaults and ignores actions after unmount', () => {
  const onValueChange = vi.fn();
  const { result, unmount } = renderHook(
    () =>
      useTreeSelect({
        ...options,
        multiple: true,
        defaultValue: ['missing'],
        showSearch: true,
        onValueChange,
      }),
    { wrapper: StrictMode },
  );
  act(() => {
    result.current.clear();
    result.current.check('front', true);
    result.current.check('back', true);
  });
  expect(result.current.value).toEqual(['dev', 'front', 'back']);
  act(() => {
    result.current.setSearch('back');
    result.current.setExpanded('dev', false);
    result.current.reset();
  });
  expect(result.current.value).toEqual(['missing']);
  expect(result.current.searchValue).toBe('');
  expect(result.current.expandedKeys).toEqual([]);
  const old = result.current;
  onValueChange.mockClear();
  unmount();
  act(() => {
    old.clear();
    old.check('front', true);
    old.setOpen(true);
  });
  expect(onValueChange).not.toHaveBeenCalled();
});

it('rejects value shapes incompatible with the selection mode', () => {
  expect(() =>
    renderHook(() => useTreeSelect({ ...options, defaultValue: ['front'] as never })),
  ).toThrow(TypeError);
  expect(() =>
    renderHook(() => useTreeSelect({ ...options, multiple: true, value: 'front' as never })),
  ).toThrow(TypeError);
});
