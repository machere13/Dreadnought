import { validateLinearDomain, linearFraction, linearTicks } from './linearScale.ts';

export interface ScatterDatum {
  id: string;
  label: string;
  x: number;
  y: number;
  size?: number;
}

export interface ScatterSeries {
  id: string;
  label: string;
  data: readonly ScatterDatum[];
}

export interface ScatterLayoutOptions {
  series: readonly ScatterSeries[];
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  width: number;
  height: number;
  pointRadius?: number;
  maxBubbleRadius?: number;
}

export interface ScatterPoint {
  id: string;
  seriesId: string;
  value: ScatterDatum;
  x: number;
  y: number;
  radius: number;
}

export interface ScatterLayout {
  width: number;
  height: number;
  xTicks: { value: number; position: number }[];
  yTicks: { value: number; position: number }[];
  series: { id: string; label: string; points: ScatterPoint[] }[];
}

export function buildScatterLayout(options: ScatterLayoutOptions): ScatterLayout {
  if (!options || typeof options !== 'object') throw new TypeError('Scatter options required');
  const {
    series,
    xDomain,
    yDomain,
    width,
    height,
    pointRadius = 5,
    maxBubbleRadius = 24,
  } = options;
  validateLinearDomain(xDomain);
  validateLinearDomain(yDomain);
  if (!Array.isArray(series)) throw new TypeError('Scatter series must be an array');
  for (const value of [width, height, pointRadius, maxBubbleRadius]) {
    if (!Number.isFinite(value) || value <= 0)
      throw new RangeError('Scatter dimensions and radii must be finite and positive');
  }
  const ids = new Set<string>();
  let maxSize = 0;
  for (const item of series) {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      typeof item.label !== 'string' ||
      !Array.isArray(item.data)
    ) {
      throw new TypeError('Scatter series require an ID, label and data array');
    }
    if (ids.has(item.id)) throw new RangeError('Scatter series IDs must be unique');
    ids.add(item.id);
    const pointIds = new Set<string>();
    for (const point of item.data) {
      if (
        !point ||
        typeof point.id !== 'string' ||
        !point.id.trim() ||
        typeof point.label !== 'string' ||
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y)
      ) {
        throw new TypeError('Scatter points require an ID, label and finite coordinates');
      }
      if (pointIds.has(point.id))
        throw new RangeError('Scatter point IDs must be unique within a series');
      pointIds.add(point.id);
      if (
        point.x < xDomain[0] ||
        point.x > xDomain[1] ||
        point.y < yDomain[0] ||
        point.y > yDomain[1]
      ) {
        throw new RangeError('Scatter coordinates must be inside domains');
      }
      if (point.size !== undefined) {
        if (!Number.isFinite(point.size) || point.size < 0)
          throw new RangeError('Scatter sizes must be finite and nonnegative');
        maxSize = Math.max(maxSize, point.size);
      }
    }
  }
  return {
    width,
    height,
    xTicks: linearTicks(xDomain, width),
    yTicks: linearTicks(yDomain, height, true),
    series: series.map((item: ScatterSeries) => ({
      id: item.id,
      label: item.label,
      points: item.data.map((value) => ({
        id: value.id,
        seriesId: item.id,
        value: { ...value },
        x: linearFraction(value.x, xDomain) * width,
        y: (1 - linearFraction(value.y, yDomain)) * height,
        radius:
          value.size === undefined
            ? pointRadius
            : maxSize === 0
              ? 0
              : maxBubbleRadius * Math.sqrt(value.size / maxSize),
      })),
    })),
  };
}
