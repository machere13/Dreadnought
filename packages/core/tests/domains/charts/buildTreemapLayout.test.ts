import { expect, it } from 'vitest';
import * as charts from '../../../src/domains/charts/index.ts';

const data = {
  id: 'all',
  label: 'Бюджет',
  children: [
    {
      id: 'dev',
      label: 'Разработка',
      children: [
        { id: 'web', label: 'Web', value: 30 },
        { id: 'api', label: 'API', value: 30 },
      ],
    },
    { id: 'design', label: 'Дизайн', value: 40 },
    { id: 'zero', label: 'Резерв', value: 0 },
  ],
};

it('aggregates leaves and tiles proportional, nonoverlapping areas with nested previews', () => {
  const before = structuredClone(data);
  const result = charts.buildTreemapLayout({ data, width: 100, height: 60 });
  expect(result.root.value).toBe(100);
  expect(result.items.map((item) => item.value)).toEqual([60, 40, 0]);
  expect(result.items[0].rect).toEqual({ x: 0, y: 0, width: 60, height: 60 });
  expect(result.items[1].rect).toEqual({ x: 60, y: 0, width: 40, height: 60 });
  expect(result.items[2].rect).toBeNull();
  const previews = result.items[0].children;
  expect(previews).toHaveLength(2);
  expect(previews[0].rect!.width * previews[0].rect!.height).toBeCloseTo(1800);
  expect(previews[1].rect!.width * previews[1].rect!.height).toBeCloseTo(1800);
  expect(data).toEqual(before);
});

it('drills into a group with ancestor breadcrumbs and two distinct shares', () => {
  const view = charts.buildTreemapLayout({ data, rootId: 'dev', width: 100, height: 60 });
  expect(view.path.map((item) => item.id)).toEqual(['all', 'dev']);
  expect(view.root.value).toBe(60);
  expect(view.items[0]).toMatchObject({ value: 30, share: 0.5, totalShare: 0.3, categoryIndex: 0 });
  expect(() => charts.buildTreemapLayout({ data, rootId: 'web' })).toThrow(/group/i);
  expect(() => charts.buildTreemapLayout({ data, rootId: 'missing' })).toThrow();
});

it('keeps empty and zero groups without artificial area', () => {
  const result = charts.buildTreemapLayout({
    data: {
      id: 'r',
      label: 'R',
      children: [
        { id: 'empty', label: 'Empty', children: [] },
        { id: 'zero', label: 'Zero', value: 0 },
      ],
    },
  });
  expect(result.root.value).toBe(0);
  expect(result.items.every((item) => item.rect === null && item.share === null)).toBe(true);
});

it('rejects cycles, duplicate IDs, mixed group values, invalid leaves and overflowing totals', () => {
  const root: any = { id: 'r', label: 'R', children: [] };
  root.children.push(root);
  const invalid = [
    root,
    { ...data, children: [data.children[1], data.children[1]] },
    { ...data, value: 100 },
    { ...data, children: [{ id: 'x', label: 'X', value: -1 }] },
    { ...data, children: [{ id: 'x', label: 'X', value: Infinity }] },
    { ...data, children: Array(2) },
    {
      ...data,
      children: [
        { id: 'a', label: 'A', value: Number.MAX_VALUE },
        { id: 'b', label: 'B', value: Number.MAX_VALUE },
      ],
    },
  ];
  for (const value of invalid) expect(() => charts.buildTreemapLayout({ data: value })).toThrow();
});

it('keeps finite areas at numerical extremes and for many siblings', () => {
  for (const value of [Number.MIN_VALUE, Number.MAX_VALUE / 4]) {
    const result = charts.buildTreemapLayout({
      data: {
        id: 'r',
        label: 'R',
        children: [
          { id: 'a', label: 'A', value },
          { id: 'b', label: 'B', value },
        ],
      },
    });
    expect(result.items[0].share).toBe(0.5);
    expect(result.items[0].rect!.width * result.items[0].rect!.height).toBeCloseTo(3000);
  }
  const result = charts.buildTreemapLayout({
    data: {
      id: 'r',
      label: 'R',
      children: Array.from({ length: 1000 }, (_, i) => ({
        id: String(i),
        label: String(i),
        value: 1,
      })),
    },
  });
  expect(
    result.items.reduce((sum, item) => sum + item.rect!.width * item.rect!.height, 0),
  ).toBeCloseTo(6000);
});
