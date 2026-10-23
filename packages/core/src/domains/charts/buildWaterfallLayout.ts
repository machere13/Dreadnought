import { linearFraction, linearTicks, validateLinearDomain } from './linearScale.ts';
import type { WaterfallLayout, WaterfallLayoutOptions, WaterfallStep } from './waterfall.types.ts';

export function buildWaterfallLayout({
  data,
  domain,
  width = 100,
  height = 100,
}: WaterfallLayoutOptions): WaterfallLayout {
  if (!Array.isArray(data)) throw new TypeError('Waterfall data must be an array');
  if (![width, height].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Waterfall dimensions must be finite and positive');
  }
  const ids = new Set<string>();
  let total = 0;
  let min = 0;
  let max = 0;
  const values = Array.from(data, (item, index) => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      typeof item.label !== 'string' ||
      !item.label.trim()
    ) {
      throw new TypeError('Waterfall steps require nonempty id and label');
    }
    if (ids.has(item.id)) throw new RangeError('Waterfall IDs must be unique');
    ids.add(item.id);
    if (!['start', 'change', 'total'].includes(item.kind))
      throw new TypeError('Invalid waterfall step kind');
    if (item.kind === 'start' && index !== 0)
      throw new RangeError('Only the first waterfall step can be start');
    if (item.kind === 'total' ? 'value' in item : !Number.isFinite(item.value)) {
      throw new TypeError('Waterfall totals have no value; other steps require a finite value');
    }
    const before = total;
    if (item.kind !== 'total')
      total = (item.kind === 'start' ? item.value : total + item.value) || 0;
    if (!Number.isFinite(total)) throw new RangeError('Waterfall accumulated value must be finite');
    const from = item.kind === 'change' ? before : 0;
    const to = total;
    min = Math.min(min, from, to);
    max = Math.max(max, from, to);
    const value = item.kind === 'total' ? total : item.value;
    const tone: WaterfallStep['tone'] =
      item.kind !== 'change'
        ? 'total'
        : value > 0
          ? 'positive'
          : value < 0
            ? 'negative'
            : 'neutral';
    return {
      id: item.id,
      label: item.label,
      kind: item.kind,
      value,
      from,
      to,
      before,
      after: total,
      tone,
    };
  });
  const scale = domain ?? (min === max ? ([0, 1] as const) : ([min, max] as const));
  validateLinearDomain(scale);
  if (scale[0] > min || scale[1] < max)
    throw new RangeError('Waterfall domain must include zero and all accumulated values');
  const coordinate = (value: number) => height * (1 - linearFraction(value, scale));
  const band = width / Math.max(1, values.length);
  return {
    domain: [scale[0], scale[1]],
    width,
    height,
    total,
    baseline: coordinate(0),
    ticks: linearTicks(scale, height, true),
    steps: values.map((step, index) => ({
      ...step,
      x: band * (index + 0.2),
      width: band * 0.6,
      y: Math.min(coordinate(step.from), coordinate(step.to)),
      height: Math.abs(coordinate(step.from) - coordinate(step.to)),
      endY: coordinate(step.after),
    })),
  };
}
