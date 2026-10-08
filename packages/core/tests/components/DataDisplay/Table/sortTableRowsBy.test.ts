import { expect, it } from 'vitest';
import { sortTableRowsBy } from '../../../../src/components/DataDisplay/Table/index.ts';

it('applies comparisons in priority order and preserves original order for ties', () => {
  const rows = [
    { id: 1, group: 2, score: 3 },
    { id: 2, group: 1, score: 4 },
    { id: 3, group: 1, score: 8 },
    { id: 4, group: 1, score: 8 },
  ];
  const sorted = sortTableRowsBy(rows, [
    { compare: (a, b) => a.group - b.group, order: 'ascend' },
    { compare: (a, b) => a.score - b.score, order: 'descend' },
  ]);
  expect(sorted.map((row) => row.id)).toEqual([3, 4, 2, 1]);
  expect(rows.map((row) => row.id)).toEqual([1, 2, 3, 4]);
});

it('ignores inactive comparisons and returns a copy without active sorts', () => {
  const rows = [3, 1, 2];
  expect(sortTableRowsBy(rows, [{ compare: (a, b) => a - b, order: null }])).toEqual([3, 1, 2]);
  expect(sortTableRowsBy(rows, [])).not.toBe(rows);
});
