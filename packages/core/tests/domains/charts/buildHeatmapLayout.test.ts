import { expect, it } from 'vitest';
import * as charts from '../../../src/domains/charts/index.ts';

const columns = [
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
];
const rows = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
];
const data = [
  { column: 'mon', row: 'a', value: 0 },
  { column: 'tue', row: 'a', value: 10 },
  { column: 'mon', row: 'b', value: null },
];

it('exports a matrix model with row-major order and distinct zero and missing values', () => {
  expect(charts).toHaveProperty('buildHeatmapLayout');
  const layout = charts.buildHeatmapLayout({ columns, rows, data });
  expect(layout.domain).toEqual([0, 10]);
  expect(layout.cells.map((cell) => [cell.value, cell.intensity])).toEqual([
    [0, 0],
    [10, 1],
    [null, null],
    [null, null],
  ]);
  expect(layout.cells[3]).toMatchObject({ columnIndex: 1, rowIndex: 1 });
  expect(new Set(layout.cells.map((cell) => cell.id)).size).toBe(4);
});

it('keeps a fixed color domain and supports signed and constant data', () => {
  const layout = charts.buildHeatmapLayout({ columns, rows, data, domain: [-10, 10] });
  expect(layout.cells[0].intensity).toBe(0.5);
  const constant = charts.buildHeatmapLayout({
    columns,
    rows,
    data: [{ column: 'mon', row: 'a', value: -7 }],
  });
  expect(constant.domain).toEqual([-7, -7]);
  expect(constant.cells[0].intensity).toBe(0.5);
  const extreme = charts.buildHeatmapLayout({
    columns,
    rows,
    data,
    domain: [-Number.MAX_VALUE, Number.MAX_VALUE],
  });
  expect(extreme.cells[0].intensity).toBe(0.5);
});

it('handles empty and missing-only data without inventing a measured zero', () => {
  expect(charts.buildHeatmapLayout({ columns: [], rows: [], data: [] }).cells).toEqual([]);
  const layout = charts.buildHeatmapLayout({ columns, rows, data: [] });
  expect(layout.domain).toBeNull();
  expect(layout.cells.every((cell) => cell.value === null && cell.intensity === null)).toBe(true);
});

it('rejects duplicate axes, coordinates, unknown categories and invalid numbers', () => {
  for (const overrides of [
    { columns: [columns[0], columns[0]] },
    { rows: [{ id: '', label: 'Bad' }] },
    { data: [data[0], data[0]] },
    { data: [{ column: 'unknown', row: 'a', value: 1 }] },
    { data: [{ column: 'mon', row: 'a', value: NaN }] },
    { data: [{ column: 'mon', row: 'a', value: Infinity }] },
    { domain: [1, 1] },
    { domain: [0, 5] },
  ]) {
    expect(() =>
      charts.buildHeatmapLayout({ columns, rows, data, ...overrides } as never),
    ).toThrow();
  }
});

it('does not mutate inputs and avoids delimiter collisions in cell IDs', () => {
  const options = {
    columns: Object.freeze([
      { id: 'a:b', label: 'A' },
      { id: 'a', label: 'B' },
    ]),
    rows: Object.freeze([
      { id: 'c', label: 'C' },
      { id: 'b:c', label: 'D' },
    ]),
    data: Object.freeze([{ column: 'a:b', row: 'c', value: 1 }]),
  };
  const layout = charts.buildHeatmapLayout(options);
  expect(new Set(layout.cells.map((cell) => cell.id)).size).toBe(4);
  layout.cells[0].column.label = 'Changed';
  expect(options.columns[0].label).toBe('A');
});
