export interface SteppedValueOptions { min: number; max: number; step?: number }

export function getSteppedValue(value: number, options: SteppedValueOptions): number {
  const { min, max, step = 1 } = options;
  if (![value, min, max, step].every(Number.isFinite)) throw new TypeError('Value and grid must be finite numbers.');
  if (min > max || step <= 0) throw new RangeError('Grid requires min <= max and step > 0.');
  const decimals = [min, max, step, Math.max(min, Math.min(max, value))].map(number => {
    const [coefficient, exponent = '0'] = String(number).split('e');
    const fraction = coefficient.split('.')[1]?.length ?? 0;
    return { integer: BigInt(coefficient.replace('.', '')), power: Number(exponent) - fraction };
  });
  const power = Math.min(...decimals.map(decimal => decimal.power));
  const [lower, upper, increment, current] = decimals.map(decimal => decimal.integer * 10n ** BigInt(decimal.power - power));
  const last = (upper - lower) / increment;
  const nearest = ((current - lower) * 2n + increment) / (increment * 2n);
  const index = nearest > last ? last : nearest;
  return Number(`${lower + index * increment}e${power}`);
}
