// @vitest-environment node
import { expect, it } from 'vitest';
import { getTreeCheckState } from '@dreadnought/core';

type Node = { id: string | number; disabled?: boolean; children?: readonly Node[] };
const records: readonly Node[] = [{ id: 'root', children: [
  { id: 'branch', children: [{ id: 0 }, { id: '' }] },
  { id: 'locked', disabled: true, children: [{ id: 'behind' }] },
] }];
const options = { getKey: (node: Node) => node.id, getChildren: (node: Node) => node.children,
  getDisabled: (node: Node) => Boolean(node.disabled) };

it('checks collapsed descendants but stops at disabled nodes', () => {
  expect(getTreeCheckState(records, { ...options, checkedKeys: ['root'] })).toEqual({
    checkedKeys: ['root', 'branch', 0, ''], halfCheckedKeys: [],
  });
});

it('derives partially checked ancestors from a checked leaf', () => {
  expect(getTreeCheckState(records, { ...options, checkedKeys: [0] })).toEqual({
    checkedKeys: [0], halfCheckedKeys: ['root', 'branch'],
  });
});

it('unchecking a descendant clears fully checked ancestors', () => {
  const checkedKeys = Object.freeze(['root']);
  expect(getTreeCheckState(records, { ...options, checkedKeys, action: { key: 0, checked: false } })).toEqual({
    checkedKeys: [''], halfCheckedKeys: ['root', 'branch'],
  });
  expect(checkedKeys).toEqual(['root']);
});

it('checking the final sibling checks parents and ignores disabled siblings', () => {
  expect(getTreeCheckState(records, { ...options, checkedKeys: [0], action: { key: '', checked: true } })).toEqual({
    checkedKeys: ['root', 'branch', 0, ''], halfCheckedKeys: [],
  });
});

it('treats disabled nodes as boundaries in both directions', () => {
  expect(getTreeCheckState(records, { ...options, checkedKeys: ['locked', 'behind'], action: { key: 'root', checked: false } })).toEqual({
    checkedKeys: ['locked', 'behind'], halfCheckedKeys: [],
  });
  expect(getTreeCheckState(records, { ...options, checkedKeys: [], action: { key: 'locked', checked: true } })).toEqual({
    checkedKeys: [], halfCheckedKeys: [],
  });
  expect(getTreeCheckState(records, { ...options, checkedKeys: ['behind'] })).toEqual({
    checkedKeys: ['behind'], halfCheckedKeys: [],
  });
});

it('keeps strict checks independent and preserves unknown keys for future data', () => {
  expect(getTreeCheckState(records, { ...options, checkStrictly: true, checkedKeys: ['root', 'future', 'future'],
    action: { key: 0, checked: true } })).toEqual({ checkedKeys: ['root', 0, 'future'], halfCheckedKeys: [] });
});

it('validates hidden duplicates and handles deep trees without recursion', () => {
  expect(() => getTreeCheckState([{ id: 'a', children: [{ id: 'a' }] }], options)).toThrow(TypeError);
  let node: Node = { id: 19999 };
  for (let id = 19998; id >= 0; id--) node = { id, children: [node] };
  const state = getTreeCheckState([node], { ...options, checkedKeys: [19999] });
  expect(state.checkedKeys).toHaveLength(20000);
  expect(state.halfCheckedKeys).toEqual([]);
});
