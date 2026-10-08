// @vitest-environment node
import { expect, it, vi } from 'vitest';
import { getSelectionValue, getVisibleTreeRows } from '@dreadnought/core';

type Node = { id: string | number; nodes?: readonly Node[] | null };
const leaf: Node = Object.freeze({ id: 'file' });
const child: Node = Object.freeze({ id: 'reports', nodes: Object.freeze([leaf]) });
const root: Node = Object.freeze({ id: 'docs', nodes: Object.freeze([child]) });
const roots = Object.freeze([root, Object.freeze({ id: 'photos' })]);
const options = { getKey: (n: Node) => n.id, getChildren: (n: Node) => n.nodes };

it('returns empty and collapsed roots without mutating records', () => {
  expect(getVisibleTreeRows([], options)).toEqual([]);
  const rows = getVisibleTreeRows(roots, options);
  expect(rows).toEqual([
    { key: 'docs', record: root, depth: 0, parentKey: null, expandable: true, expanded: false },
    {
      key: 'photos',
      record: roots[1],
      depth: 0,
      parentKey: null,
      expandable: false,
      expanded: false,
    },
  ]);
  expect(rows[0].record).toBe(root);
});

it('preserves preorder, depth and parents with nested expansion', () => {
  const rows = getVisibleTreeRows(roots, {
    ...options,
    expandedKeys: ['docs', 'reports', 'file', 'unknown', 'docs'],
  });
  expect(
    rows.map(({ key, depth, parentKey, expanded }) => [key, depth, parentKey, expanded]),
  ).toEqual([
    ['docs', 0, null, true],
    ['reports', 1, 'docs', true],
    ['file', 2, 'reports', false],
    ['photos', 0, null, false],
  ]);
  expect(rows[2].record).toBe(leaf);
});

it('retains child expansion while its parent is closed', () => {
  const expanded = Object.freeze(['docs', 'reports']);
  const closed = getSelectionValue(expanded, { type: 'toggle', value: 'docs' });
  expect(closed).toEqual(['reports']);
  expect(getVisibleTreeRows(roots, { ...options, expandedKeys: closed }).map((r) => r.key)).toEqual(
    ['docs', 'photos'],
  );
  const opened = getSelectionValue(closed, { type: 'toggle', value: 'docs' });
  expect(getVisibleTreeRows(roots, { ...options, expandedKeys: opened }).map((r) => r.key)).toEqual(
    ['docs', 'reports', 'file', 'photos'],
  );
  expect(expanded).toEqual(['docs', 'reports']);
});

it('distinguishes string and numeric keys and accepts zero and empty string', () => {
  expect(
    getVisibleTreeRows([{ id: 1 }, { id: '1' }, { id: 0 }, { id: '' }], options).map((r) => r.key),
  ).toEqual([1, '1', 0, '']);
});

it.each([{ expandedKeys: [] }, { expandedKeys: ['docs'] }])(
  'rejects duplicates in hidden branches for expansion $expandedKeys',
  ({ expandedKeys }) => {
    const data: Node[] = [{ id: 'docs', nodes: [{ id: 'duplicate' }] }, { id: 'duplicate' }];
    expect(() => getVisibleTreeRows(data, { ...options, expandedKeys })).toThrow(TypeError);
  },
);

it('rejects cycles even when collapsed', () => {
  const cyclic: Node = { id: 'cycle', nodes: [] };
  cyclic.nodes = [cyclic];
  expect(() => getVisibleTreeRows([cyclic], options)).toThrow(TypeError);
});

it.each([NaN, Infinity, -Infinity, null, {}, true])('rejects invalid key %j', (key) => {
  expect(() =>
    getVisibleTreeRows([{}], { getKey: () => key as string, getChildren: () => [] }),
  ).toThrow(TypeError);
});

it.each([{}, 'children', 1, false])('rejects non-array children %j', (children) => {
  expect(() =>
    getVisibleTreeRows([{ id: 'x' }], { ...options, getChildren: () => children as Node[] }),
  ).toThrow(TypeError);
});

it('accepts nullable children and propagates callback errors unchanged', () => {
  expect(
    getVisibleTreeRows([{ id: 'a', nodes: null }, { id: 'b' }], options).every(
      (r) => !r.expandable,
    ),
  ).toBe(true);
  const error = new Error('caller failure');
  expect(() =>
    getVisibleTreeRows(roots, {
      ...options,
      getKey: () => {
        throw error;
      },
    }),
  ).toThrow(error);
  expect(() =>
    getVisibleTreeRows(roots, {
      ...options,
      getChildren: () => {
        throw error;
      },
    }),
  ).toThrow(error);
});

it('handles a deep chain iteratively and visits each node once', () => {
  let node: Node = { id: 19999 };
  for (let id = 19998; id >= 0; id--) {
    node = { id, nodes: [node] };
  }
  const getKey = vi.fn(options.getKey);
  const getChildren = vi.fn(options.getChildren);
  const rows = getVisibleTreeRows([node], {
    getKey,
    getChildren,
    expandedKeys: Array.from({ length: 20000 }, (_, i) => i),
  });
  expect(rows).toHaveLength(20000);
  expect(rows[19999]).toMatchObject({
    key: 19999,
    depth: 19999,
    parentKey: 19998,
    expandable: false,
    expanded: false,
  });
  expect(getKey).toHaveBeenCalledTimes(20000);
  expect(getChildren).toHaveBeenCalledTimes(20000);
});

it('preserves order for a wide forest', () => {
  const nodes = Array.from({ length: 20000 }, (_, id) => ({ id }));
  const rows = getVisibleTreeRows(nodes, options);
  expect(rows.map((r) => r.key)).toEqual(nodes.map((n) => n.id));
  expect(rows.every((r) => r.depth === 0 && r.parentKey === null)).toBe(true);
});
