import { expect, it } from 'vitest';
import * as charts from '../../../src/domains/charts/index.ts';

const nodes = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
];
const links = [
  { id: 'ab', source: 'a', target: 'b', value: 60 },
  { id: 'ac', source: 'a', target: 'c', value: 40 },
];

it('conserves flow widths and does not mutate input', () => {
  const input = structuredClone({ nodes, links });
  const layout = charts.buildSankeyLayout({ ...input, height: 220, nodeGap: 20 });
  expect(input).toEqual({ nodes, links });
  expect(layout.nodes.map((n) => n.value)).toEqual([100, 60, 40]);
  expect(layout.nodes.map((n) => n.layer)).toEqual([0, 1, 1]);
  expect(layout.links.map((l) => l.width)).toEqual([120, 80]);
  expect(layout.nodes[0].height).toBe(200);
  expect(layout.links[0].sourceY).toBe(70);
  expect(layout.links[1].sourceY).toBe(170);
  expect(layout.nodes[2].y).toBe(140);
});

it('orders a DAG independently of input order and uses the larger node flow', () => {
  const layout = charts.buildSankeyLayout({
    nodes: [...nodes].reverse(),
    links: [
      { id: 'bc', source: 'b', target: 'c', value: 30 },
      { id: 'ab', source: 'a', target: 'b', value: 50 },
    ],
  });
  expect(layout.nodes.map((n) => [n.id, n.layer, n.incoming, n.outgoing, n.value])).toEqual([
    ['c', 2, 30, 0, 30],
    ['b', 1, 50, 30, 50],
    ['a', 0, 0, 50, 50],
  ]);
  expect(layout.links.every((l) => l.targetX > l.sourceX)).toBe(true);
});

it('handles empty, disconnected and very small flows with finite geometry', () => {
  expect(charts.buildSankeyLayout({ nodes: [], links: [] }).nodes).toEqual([]);
  const isolated = charts.buildSankeyLayout({ nodes, links: [] });
  expect(isolated.nodes.map((n) => n.value)).toEqual([0, 0, 0]);
  const tiny = charts.buildSankeyLayout({
    nodes,
    links: [{ ...links[0], value: Number.MIN_VALUE }],
  });
  expect(tiny.links[0].width).toBeGreaterThan(0);
  expect(Number.isFinite(tiny.links[0].width)).toBe(true);
});

it('rejects cycles, unknown endpoints, duplicate IDs, invalid values and overflow', () => {
  const invalid = [
    { nodes, links: [...links, { id: 'ba', source: 'b', target: 'a', value: 1 }] },
    { nodes, links: [{ ...links[0], target: 'missing' }] },
    { nodes: [nodes[0], nodes[0]], links: [] },
    { nodes, links: [links[0], links[0]] },
    ...[0, -1, NaN, Infinity].map((value) => ({ nodes, links: [{ ...links[0], value }] })),
    { nodes, links: links.map((l) => ({ ...l, value: Number.MAX_VALUE })) },
    { nodes, links, height: 10, nodeGap: 20 },
  ];
  for (const input of invalid) expect(() => charts.buildSankeyLayout(input)).toThrow();
});

it('grows automatic dimensions to fit custom node widths and gaps', () => {
  const layout = charts.buildSankeyLayout({ nodes, links, nodeWidth: 200, nodeGap: 500 });
  expect(layout.nodes[2].y - layout.nodes[1].y - layout.nodes[1].height).toBeCloseTo(500);
  expect(layout.links.every((link) => link.targetX > link.sourceX)).toBe(true);
  expect(layout.nodes.every((node) => node.y + node.height <= layout.height + 1e-9)).toBe(true);
  expect(() => charts.buildSankeyLayout({ nodes, links: [], nodeGap: Number.MAX_VALUE })).toThrow();
});
