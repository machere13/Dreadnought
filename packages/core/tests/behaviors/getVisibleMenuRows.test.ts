// @vitest-environment node
import { expect, it } from 'vitest';
import { getVisibleMenuRows } from '@dreadnought/core';
type Item = {
  value: string;
  kind?: 'item' | 'submenu' | 'group' | 'divider';
  disabled?: boolean;
  children?: readonly Item[];
};
const items: readonly Item[] = [
  {
    value: 'group',
    kind: 'group',
    children: [
      { value: 'copy' },
      { value: 'more', kind: 'submenu', children: [{ value: 'save' }] },
    ],
  },
  { value: 'divider', kind: 'divider' },
  { value: 'end' },
];
const options = {
  getKey: (item: Item) => item.value,
  getChildren: (item: Item) => item.children,
  getKind: (item: Item) => item.kind ?? 'item',
  getDisabled: (item: Item) => Boolean(item.disabled),
};

it('keeps groups visible and reveals only opened submenus', () => {
  expect(getVisibleMenuRows(items, options).map((row) => row.key)).toEqual([
    'group',
    'copy',
    'more',
    'divider',
    'end',
  ]);
  expect(
    getVisibleMenuRows(items, { ...options, expandedKeys: ['more'] }).map((row) => row.key),
  ).toEqual(['group', 'copy', 'more', 'save', 'divider', 'end']);
});
it('inherits disabled groups and submenus without mutating records', () => {
  const records = Object.freeze([
    {
      value: 'group',
      kind: 'group' as const,
      disabled: true,
      children: Object.freeze([{ value: 'child' }]),
    },
  ]);
  expect(getVisibleMenuRows(records, options).map((row) => row.disabled)).toEqual([true, true]);
});
it('checks duplicate keys even behind closed branches and rejects invalid structures', () => {
  expect(() =>
    getVisibleMenuRows([{ value: 'a', kind: 'submenu', children: [{ value: 'a' }] }], options),
  ).toThrow(/unique/);
  expect(() => getVisibleMenuRows([{ value: '', kind: 'item' }], options)).toThrow(/nonempty/);
  expect(() =>
    getVisibleMenuRows([{ value: 'a', kind: 'divider', children: [{ value: 'b' }] }], options),
  ).toThrow(/children/);
});
