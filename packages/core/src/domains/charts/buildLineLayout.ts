import { validateLinearDomain as validateDomain, linearFraction as fraction, linearTicks as ticks } from './linearScale.ts';

export interface LineDatum { x: number; y: number | null }
export interface LineSeries { id: string; label: string; data: readonly LineDatum[] }
export interface LineLayoutOptions {
  series: readonly LineSeries[];
  xDomain: readonly [number, number]; yDomain: readonly [number, number];
  width: number; height: number;
}
export interface LinePoint { seriesId: string; index: number; value: { x: number; y: number }; x: number; y: number }
export interface LineLayout {
  width: number; height: number;
  xTicks: Array<{ value: number; position: number }>;
  yTicks: Array<{ value: number; position: number }>;
  series: Array<{ id: string; label: string; segments: LinePoint[][] }>;
}

export function buildLineLayout(options: LineLayoutOptions): LineLayout {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Line options must be an object');
  const { series, xDomain, yDomain, width, height } = options;
  validateDomain(xDomain); validateDomain(yDomain);
  if (!Array.isArray(series) || !Number.isFinite(width) || !Number.isFinite(height)) throw new TypeError('Line series must be an array and dimensions finite');
  if (width <= 0 || height <= 0) throw new RangeError('Line dimensions must be positive');
  const ids = new Set<string>();
  const result = Array.from(series, (item: LineSeries) => {
    if (!item || typeof item.id !== 'string' || !item.id.trim() || typeof item.label !== 'string' || !Array.isArray(item.data)) throw new TypeError('Line series require an id, label and data array');
    if (ids.has(item.id)) throw new RangeError('Line series IDs must be unique');
    ids.add(item.id);
    const xs = new Set<number>();
    const data = Array.from(item.data, point => {
      if (!point || !Number.isFinite(point.x) || point.y !== null && !Number.isFinite(point.y)) throw new TypeError('Line data require finite x and finite or null y');
      if (xs.has(point.x)) throw new RangeError('Line x values must be unique within a series');
      xs.add(point.x);
      if (point.x < xDomain[0] || point.x > xDomain[1] || point.y !== null && (point.y < yDomain[0] || point.y > yDomain[1])) throw new RangeError('Line point outside domain');
      return { x: point.x, y: point.y };
    }).sort((a, b) => a.x - b.x);
    const segments: LinePoint[][] = [];
    let segment: LinePoint[] | undefined;
    data.forEach((value, index) => {
      if (value.y === null) { segment = undefined; return; }
      if (!segment) { segment = []; segments.push(segment); }
      segment.push({ seriesId: item.id, index, value: { x: value.x, y: value.y },
        x: fraction(value.x, xDomain) * width, y: (1 - fraction(value.y, yDomain)) * height });
    });
    return { id: item.id, label: item.label, segments };
  });
  return { width, height, xTicks: ticks(xDomain, width), yTicks: ticks(yDomain, height, true), series: result };
}
