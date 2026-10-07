import type { ProgressCore, ProgressCoreOptions } from './ProgressCore.ts';

export function getProgressState({ value = 0, max = 100 }: ProgressCoreOptions = {}): ProgressCore {
  if (!Number.isFinite(value) || !Number.isFinite(max)) throw new TypeError('Progress value and max must be finite numbers.');
  if (max <= 0) throw new RangeError('Progress max must be positive.');
  const normalized = Math.max(0, Math.min(max, value));
  return { value: normalized, max, percent: (normalized / max) * 100, complete: normalized === max,
    rootProps: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': normalized } };
}
