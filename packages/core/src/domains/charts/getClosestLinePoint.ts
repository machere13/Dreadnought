import type { LineLayout, LinePoint } from './buildLineLayout.ts';

export function getClosestLinePoint(layout: LineLayout, x: number, y: number, visibleSeries?: readonly string[]): LinePoint | undefined {
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('Line pointer coordinates must be finite');
  let nearest: LinePoint | undefined, distance = Infinity;
  const scale = Math.max(layout.width, layout.height, Math.abs(x), Math.abs(y));
  for (const series of layout.series) {
    if (visibleSeries && !visibleSeries.includes(series.id)) continue;
    for (const segment of series.segments) for (const point of segment) {
      const next = Math.hypot(point.x / scale - x / scale, point.y / scale - y / scale);
      if (next < distance) { distance = next; nearest = point; }
    }
  }
  return nearest;
}
