export function validateLinearDomain(domain: readonly [number, number]) {
  if (
    !Array.isArray(domain) ||
    domain.length !== 2 ||
    !Number.isFinite(domain[0]) ||
    !Number.isFinite(domain[1])
  ) {
    throw new TypeError('Domains require two finite numbers');
  }
  if (domain[0] >= domain[1]) {
    throw new RangeError('Domains require min < max');
  }
}

export function linearFraction(value: number, [min, max]: readonly [number, number]) {
  return Number.isFinite(max - min)
    ? (value - min) / (max - min)
    : (value / 2 - min / 2) / (max / 2 - min / 2);
}

export function linearTicks(domain: readonly [number, number], size: number, reverse = false) {
  return Array.from({ length: 5 }, (_, index) => {
    const t = index / 4;
    return { value: domain[0] * (1 - t) + domain[1] * t, position: size * (reverse ? 1 - t : t) };
  });
}
