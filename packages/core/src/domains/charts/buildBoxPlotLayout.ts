import { linearFraction, linearTicks, validateLinearDomain } from './linearScale.ts';

export interface BoxPlotDatum {
  id: string;
  label: string;
  values: readonly number[];
}

export interface BoxPlotOptions {
  data: readonly BoxPlotDatum[];
  domain?: readonly [number, number];
}

export interface BoxPlotSummary {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  lowerWhisker: number;
  upperWhisker: number;
}

export interface BoxPlotGroup {
  id: string;
  label: string;
  count: number;
  summary: BoxPlotSummary | null;
  positions: Omit<BoxPlotSummary, 'min' | 'max'> | null;
  outliers: { value: number; count: number; position: number }[];
}

export interface BoxPlotLayout {
  groups: BoxPlotGroup[];
  domain: [number, number] | null;
  ticks: { value: number; position: number }[];
}

function quantile(sorted: readonly number[], fraction: number) {
  const index = (sorted.length - 1) * fraction;
  const lower = Math.floor(index);
  const weight = index - lower;
  const start = sorted[lower];
  const end = sorted[Math.ceil(index)];
  return Number.isFinite(end - start)
    ? start + (end - start) * weight
    : start * (1 - weight) + end * weight;
}

export function buildBoxPlotLayout({ data, domain }: BoxPlotOptions): BoxPlotLayout {
  if (!Array.isArray(data)) throw new TypeError('BoxPlot data must be an array');
  if (domain !== undefined) validateLinearDomain(domain);
  const ids = new Set<string>();
  let min = Infinity;
  let max = -Infinity;
  const groups = Array.from(data, (item): BoxPlotGroup => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      typeof item.label !== 'string' ||
      !item.label.trim() ||
      !Array.isArray(item.values)
    ) {
      throw new TypeError('BoxPlot groups require an ID, label and values array');
    }
    if (ids.has(item.id)) throw new RangeError('BoxPlot IDs must be unique');
    ids.add(item.id);
    for (const value of item.values) {
      if (!Number.isFinite(value)) throw new TypeError('BoxPlot values must be finite numbers');
    }
    const sorted = [...item.values].sort((a, b) => a - b);
    const group: BoxPlotGroup = {
      id: item.id,
      label: item.label,
      count: sorted.length,
      summary: null,
      positions: null,
      outliers: [],
    };
    if (!sorted.length) return group;
    const q1 = quantile(sorted, 0.25);
    const median = quantile(sorted, 0.5);
    const q3 = quantile(sorted, 0.75);
    const spread = (q3 - q1) * 1.5;
    const lowerFence = Number.isFinite(spread)
      ? q1 - spread
      : (q1 / 4 - (q3 / 4 - q1 / 4) * 1.5) * 4;
    const upperFence = Number.isFinite(spread)
      ? q3 + spread
      : (q3 / 4 + (q3 / 4 - q1 / 4) * 1.5) * 4;
    const inside = (value: number) => value >= lowerFence && value <= upperFence;
    const lowerWhisker = sorted.find(inside)!;
    let lastInside = sorted.length - 1;
    while (!inside(sorted[lastInside])) lastInside -= 1;
    const upperWhisker = sorted[lastInside];
    group.summary = {
      min: sorted[0],
      q1,
      median,
      q3,
      max: sorted[sorted.length - 1],
      lowerWhisker,
      upperWhisker,
    };
    min = Math.min(min, group.summary.min);
    max = Math.max(max, group.summary.max);
    for (const value of sorted) {
      if (inside(value)) continue;
      const previous = group.outliers[group.outliers.length - 1];
      if (previous?.value === value) previous.count += 1;
      else group.outliers.push({ value, count: 1, position: 0 });
    }
    return group;
  });
  if (domain) {
    if (min < domain[0] || max > domain[1]) {
      throw new RangeError('BoxPlot values must be inside domain');
    }
    [min, max] = domain;
  } else if (min === Infinity) {
    return { groups, domain: null, ticks: [] };
  } else if (min === max) {
    const padding = Math.max(Math.abs(min) * 0.01, 0.5);
    min = Math.max(-Number.MAX_VALUE, min - padding);
    max = Math.min(Number.MAX_VALUE, max + padding);
  }
  const range: [number, number] = [min, max];
  for (const group of groups) {
    if (!group.summary) continue;
    const { q1, median, q3, lowerWhisker, upperWhisker } = group.summary;
    group.positions = {
      q1: linearFraction(q1, range),
      median: linearFraction(median, range),
      q3: linearFraction(q3, range),
      lowerWhisker: linearFraction(lowerWhisker, range),
      upperWhisker: linearFraction(upperWhisker, range),
    };
    for (const outlier of group.outliers) outlier.position = linearFraction(outlier.value, range);
  }
  return { groups, domain: range, ticks: linearTicks(range, 1) };
}
