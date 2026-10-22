import type { PieSlice } from '@dreadnought/core';

export function getPiePath(slice: PieSlice, radius: number, innerRadius: number): string {
  const { startAngle, endAngle, share } = slice;
  const point = (r: number, angle: number) => `${r * Math.cos(angle)} ${r * Math.sin(angle)}`;
  const arc = (r: number, angle: number, large: number, sweep: number) =>
    `A ${r} ${r} 0 ${large} ${sweep} ${point(r, angle)}`;
  if (share === 1) {
    const middle = startAngle + Math.PI;
    const outer = `M ${point(radius, startAngle)} ${arc(radius, middle, 0, 1)} ${arc(radius, endAngle, 0, 1)} Z`;
    return innerRadius === 0
      ? outer
      : `${outer} M ${point(innerRadius, startAngle)} ${arc(innerRadius, middle, 0, 0)} ${arc(innerRadius, endAngle, 0, 0)} Z`;
  }
  const large = Number(share > 0.5);
  const outer = `M ${point(radius, startAngle)} ${arc(radius, endAngle, large, 1)}`;
  return innerRadius === 0
    ? `${outer} L 0 0 Z`
    : `${outer} L ${point(innerRadius, endAngle)} ${arc(innerRadius, startAngle, large, 0)} Z`;
}
