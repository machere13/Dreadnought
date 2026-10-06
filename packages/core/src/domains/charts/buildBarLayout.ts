import { linearFraction, linearTicks, validateLinearDomain } from './linearScale.ts';

export interface BarCategory { id: string; label: string }
export interface BarSeries { id: string; label: string; values: Readonly<Record<string, number | null>> }
export interface BarLayoutOptions {
  categories: readonly BarCategory[];
  series: readonly BarSeries[];
  domain: readonly [number, number];
  width: number; height: number;
  orientation?: 'vertical' | 'horizontal';
  gapRatio?: number;
}
export interface BarRect { seriesId: string; categoryId: string; value: number; x: number; y: number; width: number; height: number }
export interface BarLayout {
  width: number; height: number; orientation: 'vertical' | 'horizontal'; baseline: number;
  ticks: Array<{ value: number; position: number }>;
  categories: Array<BarCategory & { position: number }>;
  bars: BarRect[];
}

function validateItems(items: readonly { id: string; label: string }[]) {
  const ids = new Set<string>();
  Array.from(items, item => {
    if (!item || typeof item.id !== 'string' || !item.id.trim() || typeof item.label !== 'string') throw new TypeError('Bar items require an id and label');
    if (ids.has(item.id)) throw new RangeError('Bar item IDs must be unique');
    ids.add(item.id);
  });
  return ids;
}

export function buildBarLayout(options: BarLayoutOptions): BarLayout {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Bar options must be an object');
  const { categories, series, domain, width, height, orientation = 'vertical', gapRatio = 0.2 } = options;
  validateLinearDomain(domain);
  if (domain[0] > 0 || domain[1] < 0) throw new RangeError('Bar domain must include zero');
  if (!Array.isArray(categories) || !Array.isArray(series) || !Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(gapRatio)) throw new TypeError('Bar arrays and finite dimensions are required');
  if (width <= 0 || height <= 0 || gapRatio < 0 || gapRatio >= 1) throw new RangeError('Bar dimensions must be positive and gapRatio within [0, 1)');
  if (orientation !== 'vertical' && orientation !== 'horizontal') throw new RangeError('Invalid bar orientation');
  const categoryIds = validateItems(categories);
  validateItems(series);
  series.forEach(item => {
    if (!item.values || typeof item.values !== 'object' || Array.isArray(item.values)) throw new TypeError('Bar values must be a record');
    Object.getOwnPropertyNames(item.values).forEach(id => {
      const value = item.values[id];
      if (!categoryIds.has(id)) throw new RangeError('Unknown bar category');
      if (value !== null && (typeof value !== 'number' || !Number.isFinite(value))) throw new TypeError('Bar values must be finite or null');
      if (value !== null && (value < domain[0] || value > domain[1])) throw new RangeError('Bar value outside domain');
    });
  });
  const vertical = orientation === 'vertical';
  const extent = vertical ? height : width;
  const coordinate = (value: number) => extent * (vertical ? 1 - linearFraction(value, domain) : linearFraction(value, domain));
  const baseline = coordinate(0);
  const band = (vertical ? width : height) / Math.max(1, categories.length);
  const groupBand = band * (1 - gapRatio);
  const seriesBand = groupBand / Math.max(1, series.length);
  const thickness = seriesBand * (1 - gapRatio);
  const bars: BarRect[] = [];
  categories.forEach((category, categoryIndex) => series.forEach((item, seriesIndex) => {
    if (!Object.hasOwn(item.values, category.id)) return;
    const value = item.values[category.id];
    if (value === null) return;
    const position = categoryIndex * band + band * gapRatio / 2 + seriesIndex * seriesBand + seriesBand * gapRatio / 2;
    const end = coordinate(value);
    const start = Math.min(baseline, end);
    const length = Math.abs(baseline - end);
    bars.push({ seriesId: item.id, categoryId: category.id, value,
      x: vertical ? position : start, y: vertical ? start : position,
      width: vertical ? thickness : length, height: vertical ? length : thickness });
  }));
  return { width, height, orientation, baseline, ticks: linearTicks(domain, extent, vertical),
    categories: categories.map((category, index) => ({ ...category, position: band * (index + 0.5) })), bars };
}
