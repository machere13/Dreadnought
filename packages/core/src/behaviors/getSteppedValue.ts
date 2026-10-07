export interface SteppedValueOptions { min: number; max: number; step?: number | null; points?: readonly number[] }

function decimalIntegers(values: number[]) {
  const decimals = values.map(number => {
    const [coefficient, exponent = '0'] = String(number).split('e');
    const fraction = coefficient.split('.')[1]?.length ?? 0;
    return { integer: BigInt(coefficient.replace('.', '')), power: Number(exponent) - fraction };
  });
  const power = Math.min(...decimals.map(decimal => decimal.power));
  return { power, integers: decimals.map(decimal => decimal.integer * 10n ** BigInt(decimal.power - power)) };
}

export function getSteppedValue(value: number, options: SteppedValueOptions): number {
  const { min, max, step = 1, points = [] } = options;
  if (points.length || step === null) {
    if (![value, min, max, ...points].every(Number.isFinite)) throw new TypeError('Value, bounds and points must be finite numbers.');
    if (min > max) throw new RangeError('Grid requires min <= max.');
    const candidates = points.filter(point => point >= min && point <= max);
    if (step !== null) candidates.push(getSteppedValue(value, { min, max, step }));
    if (!candidates.length) throw new RangeError('A discrete grid requires at least one point within its bounds.');
    const { integers } = decimalIntegers([Math.max(min, Math.min(max, value)), ...candidates]);
    const [current, ...scaled] = integers;
    const distance = (point: bigint) => point > current ? point - current : current - point;
    const index = scaled.reduce((nearest, point, index) => distance(point) < distance(scaled[nearest])
      || (distance(point) === distance(scaled[nearest]) && point > scaled[nearest]) ? index : nearest, 0);
    return candidates[index];
  }
  if (![value, min, max, step].every(Number.isFinite)) throw new TypeError('Value and grid must be finite numbers.');
  if (min > max || step <= 0) throw new RangeError('Grid requires min <= max and step > 0.');
  const { power, integers: [lower, upper, increment, current] } = decimalIntegers([min, max, step, Math.max(min, Math.min(max, value))]);
  const last = (upper - lower) / increment;
  const nearest = ((current - lower) * 2n + increment) / (increment * 2n);
  const index = nearest > last ? last : nearest;
  return Number(`${lower + index * increment}e${power}`);
}
