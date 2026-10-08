import type { LinePoint } from './buildLineLayout.ts';

export function getLinePointAtX(points: readonly LinePoint[], x: number): LinePoint | undefined {
  if (!Number.isFinite(x)) {
    throw new TypeError('Line pointer x must be finite');
  }
  let low = 0;
  let high = points.length;
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (points[middle].value.x < x) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  const before = points[low - 1];
  const after = points[low];
  if (!before) {
    return after;
  }
  if (!after) {
    return before;
  }
  const previousDistance = x - before.value.x;
  const nextDistance = after.value.x - x;
  return Number.isFinite(previousDistance) && Number.isFinite(nextDistance)
    ? previousDistance <= nextDistance
      ? before
      : after
    : x / 2 - before.value.x / 2 <= after.value.x / 2 - x / 2
      ? before
      : after;
}
