import { validateLinearDomain } from './linearScale.ts';

export interface HistogramOptions {
  data: readonly number[];
  bins?: number;
  domain?: readonly [number, number];
}

export interface HistogramBin {
  lower: number;
  upper: number;
  count: number;
  proportion: number;
  inclusiveUpper: boolean;
}

export interface HistogramLayout {
  bins: HistogramBin[];
  total: number;
  domain: [number, number] | null;
}

export function buildHistogram({ data, bins, domain }: HistogramOptions): HistogramLayout {
  if (!Array.isArray(data)) {
    throw new TypeError('Histogram data must be an array of finite numbers');
  }
  const count = bins ?? Math.min(100, Math.ceil(Math.log2(data.length || 1)) + 1);
  if (!Number.isInteger(count) || count < 1 || count > 1000) {
    throw new RangeError('Histogram bins must be an integer from 1 to 1000');
  }
  if (domain !== undefined) {
    validateLinearDomain(domain);
  }
  let min = Infinity;
  let max = -Infinity;
  for (const value of data) {
    if (!Number.isFinite(value)) {
      throw new TypeError('Histogram observations must be finite numbers');
    }
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (!data.length && !domain) {
    return { bins: [], total: 0, domain: null };
  }
  if (domain) {
    if (min < domain[0] || max > domain[1]) {
      throw new RangeError('Histogram observations must be inside domain');
    }
    [min, max] = domain;
  } else if (min === max) {
    const padding = Math.max(Math.abs(min) * 0.01, 0.5);
    min = Math.max(-Number.MAX_VALUE, min - padding);
    max = Math.min(Number.MAX_VALUE, max + padding);
  }
  const boundaries = Array.from({ length: count + 1 }, (_, index) => {
    if (index === 0) return min;
    if (index === count) return max;
    const fraction = index / count;
    return Number.isFinite(max - min)
      ? min + (max - min) * fraction
      : min * (1 - fraction) + max * fraction;
  });
  const intervals = boundaries.slice(1).map((upper, index): HistogramBin => {
    const lower = boundaries[index];
    if (!(lower < upper)) {
      throw new RangeError('Histogram intervals are below numeric precision; reduce bins');
    }
    return { lower, upper, count: 0, proportion: 0, inclusiveUpper: index === count - 1 };
  });
  for (const value of data) {
    let left = 0;
    let right = count - 1;
    while (left < right) {
      const middle = Math.floor((left + right) / 2);
      if (value < intervals[middle].upper) right = middle;
      else left = middle + 1;
    }
    intervals[left].count += 1;
  }
  for (const bin of intervals) {
    bin.proportion = data.length ? bin.count / data.length : 0;
  }
  return { bins: intervals, total: data.length, domain: [min, max] };
}
