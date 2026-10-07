import { getSteppedValue } from './getSteppedValue.ts';
import type { SteppedValueOptions } from './getSteppedValue.ts';

export interface SteppedRangeUpdate { index: 0 | 1; value: number }

export function getSteppedRange(value: readonly [number, number], options: SteppedValueOptions,
  update?: SteppedRangeUpdate): [number, number] {
  if (!Array.isArray(value) || value.length !== 2) throw new TypeError('Range requires exactly two numbers.');
  const first = getSteppedValue(value[0], options), second = getSteppedValue(value[1], options);
  const range: [number, number] = [Math.min(first, second), Math.max(first, second)];
  if (update) {
    if (update.index !== 0 && update.index !== 1) throw new TypeError('Range endpoint must be 0 or 1.');
    const next = getSteppedValue(update.value, options);
    range[update.index] = update.index === 0 ? Math.min(next, range[1]) : Math.max(next, range[0]);
  }
  return range;
}
