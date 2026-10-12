// @vitest-environment node
import { expect, it, vi } from 'vitest';
import { getTreeSearchRows } from '@dreadnought/core';

type Node = { id: string | number; label: string; children?: readonly Node[] };
const records: readonly Node[] = Object.freeze([
  Object.freeze({
    id: 'dev',
    label: 'Разработка',
    children: Object.freeze([
      Object.freeze({ id: 'front', label: 'Frontend' }),
      Object.freeze({ id: 'back', label: 'Backend' }),
    ]),
  }),
  Object.freeze({ id: 'sales', label: 'Продажи' }),
]);
const options = {
  getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label,
};

it('keeps matching children and ancestors without losing the full checking dataset', () => {
  const expandedKeys = Object.freeze(['sales']);
  const result = getTreeSearchRows(records, { ...options, expandedKeys, searchValue: ' FRONT ' });
  expect(result.rows.map((row) => row.key)).toEqual(['dev', 'front']);
  expect(result.includedKeys).toEqual(['dev', 'front']);
  expect(result.matchedKeys).toEqual(['front']);
  expect(result.expandedKeys).toEqual(['dev']);
  expect(result.allRows.map((row) => row.key)).toEqual(['dev', 'front', 'back', 'sales']);
  expect(result.rows[1].record).toBe(records[0].children![0]);
  expect(expandedKeys).toEqual(['sales']);
});

it('returns normal user expansion for an empty query', () => {
  expect(getTreeSearchRows(records, options).rows.map((row) => row.key)).toEqual(['dev', 'sales']);
  const result = getTreeSearchRows(records, {
    ...options,
    searchValue: ' ',
    expandedKeys: ['dev'],
  });
  expect(result.rows.map((row) => row.key)).toEqual(['dev', 'front', 'back', 'sales']);
  expect(result.expandedKeys).toEqual(['dev']);
  expect(result.matchedKeys).toEqual([]);
});

it('handles empty trees and searches with no matches', () => {
  expect(getTreeSearchRows([], options).allRows).toEqual([]);
  const result = getTreeSearchRows(records, { ...options, searchValue: 'missing' });
  expect(result.rows).toEqual([]);
  expect(result.includedKeys).toEqual([]);
  expect(result.expandedKeys).toEqual([]);
});

it('does not include unrelated descendants when only a parent matches', () => {
  const result = getTreeSearchRows(records, { ...options, searchValue: 'разработка' });
  expect(result.rows).toMatchObject([{ key: 'dev', expandable: false, expanded: false }]);
});

it('supports custom matching and shared ancestors without duplicate rows', () => {
  const filterNode = vi.fn(
    (text: string, node: Node) => text === 'end' && node.label.endsWith('end'),
  );
  const result = getTreeSearchRows(records, { ...options, searchValue: ' end ', filterNode });
  expect(result.rows.map((row) => row.key)).toEqual(['dev', 'front', 'back']);
  expect(result.matchedKeys).toEqual(['front', 'back']);
  expect(filterNode).toHaveBeenCalledTimes(4);
});

it('uses temporary search expansion without overwriting normal expansion', () => {
  const result = getTreeSearchRows(records, {
    ...options,
    expandedKeys: ['dev'],
    searchValue: 'front',
    searchExpandedKeys: [],
  });
  expect(result.rows).toMatchObject([{ key: 'dev', expandable: true, expanded: false }]);
  expect(result.includedKeys).toEqual(['dev', 'front']);
  expect(result.expandedKeys).toEqual([]);
});

it('keeps numeric zero and string zero distinct', () => {
  const result = getTreeSearchRows(
    [
      { id: 0, label: 'Zero' },
      { id: '0', label: 'Zero' },
    ],
    {
      ...options,
      searchValue: 'zero',
    },
  );
  expect(result.rows.map((row) => row.key)).toEqual([0, '0']);
});

it('rejects invalid trees and malformed label or filter results', () => {
  expect(() => getTreeSearchRows([{ id: NaN, label: 'bad' }], options)).toThrow(TypeError);
  expect(() => getTreeSearchRows([records[0], records[0]], options)).toThrow(TypeError);
  const cyclic: Node = { id: 'loop', label: 'Loop' };
  cyclic.children = [cyclic];
  expect(() => getTreeSearchRows([cyclic], options)).toThrow(TypeError);
  expect(() =>
    getTreeSearchRows(records, {
      ...options,
      searchValue: 'x',
      getLabel: () => null as never,
    }),
  ).toThrow(TypeError);
  expect(() =>
    getTreeSearchRows(records, {
      ...options,
      searchValue: 'x',
      filterNode: () => 'false' as never,
    }),
  ).toThrow(TypeError);
});

it('searches a deep tree without recursion or repeating label work', () => {
  let root: Node = { id: 1999, label: 'match' };
  for (let index = 1998; index >= 0; index--)
    root = { id: index, label: 'match', children: [root] };
  const getLabel = vi.fn((node: Node) => node.label);
  const result = getTreeSearchRows([root], { ...options, getLabel, searchValue: 'match' });
  expect(result.rows).toHaveLength(2000);
  expect(result.rows[1999]).toMatchObject({ key: 1999, depth: 1999 });
  expect(getLabel).toHaveBeenCalledTimes(2000);
});
