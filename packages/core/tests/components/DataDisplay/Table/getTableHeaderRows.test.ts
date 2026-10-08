import { expect, it } from 'vitest';
import * as core from '../../../../src/index.ts';

it('derives leaf order and unequal-depth header spans without mutating columns', () => {
  const columns = Object.freeze([
    Object.freeze({ key: 'name' }),
    Object.freeze({
      key: 'contact',
      children: Object.freeze([
        Object.freeze({ key: 'email' }),
        Object.freeze({
          key: 'address',
          children: Object.freeze([Object.freeze({ key: 'city' }), Object.freeze({ key: 'zip' })]),
        }),
      ]),
    }),
  ]);
  const result = core.getTableHeaderRows(columns);
  expect(result.columns.map((column) => column.key)).toEqual(['name', 'email', 'city', 'zip']);
  expect(
    result.rows.map((row) =>
      row.map((cell) => [cell.column.key, cell.columnIndex, cell.colSpan, cell.rowSpan]),
    ),
  ).toEqual([
    [
      ['name', 0, 1, 3],
      ['contact', 1, 3, 1],
    ],
    [
      ['email', 1, 1, 2],
      ['address', 2, 2, 1],
    ],
    [
      ['city', 2, 1, 1],
      ['zip', 3, 1, 1],
    ],
  ]);
  expect(result.columns[0]).toBe(columns[0]);
});

it('treats empty children as a leaf and handles an empty table', () => {
  expect(core.getTableHeaderRows([])).toEqual({ columns: [], rows: [] });
  expect(core.getTableHeaderRows([{ key: 'empty', children: [] }]).rows[0]![0]).toMatchObject({
    colSpan: 1,
    rowSpan: 1,
    columnIndex: 0,
  });
});

it('rejects duplicate and cyclic column trees', () => {
  expect(() => core.getTableHeaderRows([{ key: 'a', children: [{ key: 'a' }] }])).toThrow(/unique/);
  const cycle: { key: string; children?: (typeof cycle)[] } = { key: 'cycle' };
  cycle.children = [cycle];
  expect(() => core.getTableHeaderRows([cycle])).toThrow(/cyclic/);
});

it('handles deeply nested groups without recursive stack overflow', () => {
  let column: { key: string; children?: (typeof column)[] } = { key: 'leaf' };
  for (let index = 0; index < 12000; index++) {
    column = { key: `g${index}`, children: [column] };
  }
  const result = core.getTableHeaderRows([column]);
  expect(result.rows).toHaveLength(12001);
  expect(result.columns.map((column) => column.key)).toEqual(['leaf']);
});

it('removes hidden branches and empty groups before calculating depth and spans', () => {
  const result = core.getTableHeaderRows([
    { key: 'name' },
    { key: 'contact', children: [{ key: 'email', hidden: true }, { key: 'city' }] },
    { key: 'empty', children: [{ key: 'zip', hidden: true }] },
    { key: 'secret', hidden: true, children: [{ key: 'deep', children: [{ key: 'value' }] }] },
  ]);
  expect(result.columns.map((column) => column.key)).toEqual(['name', 'city']);
  expect(
    result.rows.map((row) =>
      row.map((cell) => [cell.column.key, cell.columnIndex, cell.colSpan, cell.rowSpan]),
    ),
  ).toEqual([
    [
      ['name', 0, 1, 2],
      ['contact', 1, 1, 1],
    ],
    [['city', 1, 1, 1]],
  ]);
  expect(core.getTableHeaderRows([{ key: 'hidden', hidden: true }])).toEqual({
    columns: [],
    rows: [],
  });
});
