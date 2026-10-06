import type { LineLayout, LinePoint } from './buildLineLayout.ts';
import { linearFraction, linearTicks, validateLinearDomain } from './linearScale.ts';

export function sampleLineLayout(source: LineLayout, width: number, height: number, xDomain: readonly [number, number]): LineLayout {
  validateLinearDomain(xDomain);
  if (!Number.isFinite(width) || !Number.isFinite(height)) throw new TypeError('Line dimensions must be finite');
  if (width <= 0 || height <= 0) throw new RangeError('Line dimensions must be positive');
  return { width, height, xTicks: linearTicks(xDomain, width),
    yTicks: source.yTicks.map(tick => ({ ...tick, position: tick.position / source.height * height })),
    series: source.series.map(item => {
      type Entry = { point: LinePoint; segment: number; position: number };
      const buckets = new Map<number, { first: Entry; last: Entry; min: Entry; max: Entry }>();
      item.segments.forEach((segment, segmentIndex) => {
        if (segment.at(-1)!.value.x < xDomain[0] || segment[0].value.x > xDomain[1]) return;
        segment.forEach((point, index) => {
          if (point.value.x < xDomain[0] && segment[index + 1]?.value.x < xDomain[0]) return;
          if (point.value.x > xDomain[1] && segment[index - 1]?.value.x > xDomain[1]) return;
          const column = Math.max(-1, Math.min(Math.ceil(width), Math.floor(linearFraction(point.value.x, xDomain) * width)));
          const entry = { point, segment: segmentIndex, position: index }, bucket = buckets.get(column);
          if (!bucket) buckets.set(column, { first: entry, last: entry, min: entry, max: entry });
          else {
            bucket.last = entry;
            if (point.value.y < bucket.min.point.value.y) bucket.min = entry;
            if (point.value.y > bucket.max.point.value.y) bucket.max = entry;
          }
        });
      });
      const selected = new Map<number, Entry>();
      for (const bucket of buckets.values()) for (const entry of [bucket.first, bucket.min, bucket.max, bucket.last]) selected.set(entry.point.index, entry);
      const segments: LinePoint[][] = [];
      let previous = -1;
      for (const { point, segment, position } of [...selected.values()].sort((a, b) => a.point.index - b.point.index)) {
        if (previous !== segment) { segments.push([]); previous = segment; }
        let x = linearFraction(point.value.x, xDomain) * width, y = point.y / source.height * height;
        if (point.value.x < xDomain[0] || point.value.x > xDomain[1]) {
          const before = point.value.x < xDomain[0];
          const neighbor = item.segments[segment][position + (before ? 1 : -1)];
          const a = before ? point : neighbor, b = before ? neighbor : point;
          const t = linearFraction(before ? xDomain[0] : xDomain[1], [a.value.x, b.value.x]);
          x = before ? 0 : width;
          y = (a.y * (1 - t) + b.y * t) / source.height * height;
        }
        segments.at(-1)!.push({ ...point, value: { ...point.value }, x, y });
      }
      return { id: item.id, label: item.label, segments };
    }),
  };
}
