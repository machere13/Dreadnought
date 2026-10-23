import { linearFraction, linearTicks, validateLinearDomain } from './linearScale.ts';
import type { CandlestickLayout, CandlestickLayoutOptions } from './candlestick.types.ts';

export function buildCandlestickLayout({
  data,
  domain,
  width = 100,
  height = 100,
}: CandlestickLayoutOptions): CandlestickLayout {
  if (!Array.isArray(data)) throw new TypeError('Candlestick data must be an array');
  if (![width, height].every((value) => Number.isFinite(value) && value > 0))
    throw new RangeError('Candlestick dimensions must be finite and positive');
  const ids = new Set<string>();
  let min = Infinity;
  let max = -Infinity;
  const values = Array.from(data, (item) => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      typeof item.label !== 'string' ||
      !item.label.trim() ||
      ids.has(item.id)
    )
      throw new TypeError('Candlesticks require unique nonempty IDs and labels');
    const { open, high, low, close } = item;
    if (![open, high, low, close].every(Number.isFinite))
      throw new TypeError('Candlestick OHLC values must be finite numbers');
    if (low > Math.min(open, close) || high < Math.max(open, close))
      throw new RangeError('Candlestick low <= open/close <= high is required');
    ids.add(item.id);
    min = Math.min(min, low);
    max = Math.max(max, high);
    return { id: item.id, label: item.label, open, high, low, close };
  });
  let automatic: readonly [number, number] = data.length ? [min, max] : [0, 1];
  if (min === max) {
    const padding = Math.max(1, Math.abs(min) * 0.01);
    const lower = min - padding;
    const upper = max + padding;
    automatic = [Number.isFinite(lower) ? lower : min, Number.isFinite(upper) ? upper : max];
  }
  const scale = domain ?? automatic;
  validateLinearDomain(scale);
  if (data.length && (scale[0] > min || scale[1] < max))
    throw new RangeError('Candlestick domain must include all low/high values');
  const coordinate = (value: number) => height * (1 - linearFraction(value, scale));
  const band = width / Math.max(1, values.length);
  return {
    width,
    height,
    domain: [scale[0], scale[1]],
    ticks: linearTicks(scale, height, true),
    candles: values.map((item, index) => {
      const openY = coordinate(item.open);
      const closeY = coordinate(item.close);
      return {
        ...item,
        trend: item.close > item.open ? 'up' : item.close < item.open ? 'down' : 'flat',
        x: band * (index + 0.2),
        width: band * 0.6,
        y: Math.min(openY, closeY),
        height: Math.abs(openY - closeY),
        openY,
        closeY,
        highY: coordinate(item.high),
        lowY: coordinate(item.low),
      };
    }),
  };
}
