import type { TreemapRect } from './treemap.types.ts';

export function treemapRects(values: readonly number[], width: number, height: number) {
  const result: (TreemapRect | null)[] = values.map(() => null);
  const indexes = values.flatMap((value, index) => (value > 0 ? [index] : []));
  function split(start: number, end: number, rect: TreemapRect) {
    if (start === end) return;
    if (end - start === 1) {
      result[indexes[start]] = rect;
      return;
    }
    const middle = Math.floor((start + end) / 2);
    let first = 0;
    let second = 0;
    for (let i = start; i < middle; i++) first += values[indexes[i]];
    for (let i = middle; i < end; i++) second += values[indexes[i]];
    const ratio = first / (first + second);
    if (rect.width >= rect.height) {
      const size = rect.width * ratio;
      split(start, middle, { ...rect, width: size });
      split(middle, end, { ...rect, x: rect.x + size, width: rect.width - size });
    } else {
      const size = rect.height * ratio;
      split(start, middle, { ...rect, height: size });
      split(middle, end, { ...rect, y: rect.y + size, height: rect.height - size });
    }
  }
  split(0, indexes.length, { x: 0, y: 0, width, height });
  return result;
}
