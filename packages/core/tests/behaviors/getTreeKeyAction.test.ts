import { expect, it } from 'vitest';
import { getTreeKeyAction, getVisibleTreeRows } from '@dreadnought/core';

type Node = { id: string | number; children?: readonly Node[] };
const records: readonly Node[] = [
  { id: 0, children: [{ id: 1, children: [{ id: '' }] }, { id: '1' }] },
  { id: 'end' },
];
const project = (expandedKeys: readonly (string | number)[]) =>
  getVisibleTreeRows(records, {
    getKey: (node) => node.id,
    getChildren: (node) => node.children,
    expandedKeys,
  });

it('assigns Enter to selection and Space to checking when enabled', () => {
  const rows = project([0]);
  expect(getTreeKeyAction(rows, '1', 'Enter', { selectable: true, checkable: true })).toEqual({
    type: 'select',
    key: '1',
  });
  expect(getTreeKeyAction(rows, 0, ' ', { selectable: true, checkable: true })).toEqual({
    type: 'check',
    key: 0,
  });
  expect(getTreeKeyAction(rows, '1', ' ', { selectable: true })).toEqual({
    type: 'select',
    key: '1',
  });
});

it('moves through visible rows without wrapping or coercing keys', () => {
  const rows = project([0, 1]);
  for (const [current, key, target] of [
    [0, 'ArrowDown', 1],
    [1, 'ArrowDown', ''],
    ['', 'ArrowDown', '1'],
    ['1', 'ArrowUp', ''],
    ['end', 'Home', 0],
    [0, 'End', 'end'],
  ] as const) {
    expect(getTreeKeyAction(rows, current, key)).toEqual({ type: 'focus', key: target });
  }
  for (const [current, key] of [
    [0, 'ArrowUp'],
    ['end', 'ArrowDown'],
    [0, 'Home'],
    ['end', 'End'],
  ] as const) {
    expect(getTreeKeyAction(rows, current, key)).toBeUndefined();
  }
});

it('expands, enters, closes and leaves branches', () => {
  expect(getTreeKeyAction(project([]), 0, 'ArrowRight')).toEqual({
    type: 'expand',
    key: 0,
    expanded: true,
  });
  expect(getTreeKeyAction(project([0]), 0, 'ArrowRight')).toEqual({ type: 'focus', key: 1 });
  expect(getTreeKeyAction(project([0, 1]), 1, 'ArrowLeft')).toEqual({
    type: 'expand',
    key: 1,
    expanded: false,
  });
  expect(getTreeKeyAction(project([0]), 1, 'ArrowLeft')).toEqual({ type: 'focus', key: 0 });
  expect(getTreeKeyAction(project([0, 1]), '', 'ArrowLeft')).toEqual({ type: 'focus', key: 1 });
  for (const key of ['Enter', ' ']) {
    expect(getTreeKeyAction(project([]), 0, key)).toEqual({
      type: 'expand',
      key: 0,
      expanded: true,
    });
    expect(getTreeKeyAction(project([0]), 0, key)).toEqual({
      type: 'expand',
      key: 0,
      expanded: false,
    });
    expect(getTreeKeyAction(project([0]), '1', key)).toBeUndefined();
  }
});

it('ignores unknown, hidden and leaf actions without mutating rows', () => {
  const rows = project([]);
  const before = JSON.stringify(rows);
  expect(getTreeKeyAction(rows, 1, 'ArrowDown')).toBeUndefined();
  expect(getTreeKeyAction(rows, 'missing', 'Home')).toBeUndefined();
  expect(getTreeKeyAction(rows, 'end', 'ArrowRight')).toBeUndefined();
  expect(getTreeKeyAction(rows, 0, 'ArrowLeft')).toBeUndefined();
  expect(getTreeKeyAction(rows, 0, 'Tab')).toBeUndefined();
  expect(getTreeKeyAction([], 0, 'Home')).toBeUndefined();
  expect(JSON.stringify(rows)).toBe(before);
});
