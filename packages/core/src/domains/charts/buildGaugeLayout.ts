import { linearFraction, validateLinearDomain } from './linearScale.ts';

export interface GaugeThreshold {
  id: string;
  label: string;
  to: number;
}
export type GaugeVariant = 'semicircle' | 'circle';
export interface GaugeLayoutOptions {
  value: number | null;
  min?: number;
  max?: number;
  variant?: GaugeVariant;
  thresholds?: readonly GaugeThreshold[];
}
export interface GaugeSegment extends GaugeThreshold {
  from: number;
  index: number;
  startAngle: number;
  endAngle: number;
}
export interface GaugeLayout {
  value: number | null;
  min: number;
  max: number;
  variant: GaugeVariant;
  ratio: number | null;
  startAngle: number;
  endAngle: number;
  needle: { x: number; y: number } | null;
  segments: GaugeSegment[];
  activeSegmentId: string | null;
}

export function buildGaugeLayout({
  value,
  min = 0,
  max = 100,
  variant = 'semicircle',
  thresholds = [],
}: GaugeLayoutOptions): GaugeLayout {
  validateLinearDomain([min, max]);
  if (value !== null && (!Number.isFinite(value) || value < min || value > max))
    throw new RangeError('Gauge value must be null or a finite number in [min, max]');
  if (variant !== 'semicircle' && variant !== 'circle')
    throw new TypeError('Gauge variant must be semicircle or circle');
  if (!Array.isArray(thresholds)) throw new TypeError('Gauge thresholds must be an array');
  const startAngle = variant === 'circle' ? Math.PI * 0.75 : Math.PI;
  const sweep = variant === 'circle' ? Math.PI * 1.5 : Math.PI;
  const angle = (number: number) => startAngle + linearFraction(number, [min, max]) * sweep;
  const segments: GaugeSegment[] = [];
  const ids = new Set<string>();
  let from = min;
  for (const threshold of thresholds) {
    if (
      !threshold ||
      typeof threshold.id !== 'string' ||
      !threshold.id.trim() ||
      typeof threshold.label !== 'string' ||
      !threshold.label.trim() ||
      ids.has(threshold.id)
    )
      throw new TypeError('Gauge thresholds require unique nonempty IDs and labels');
    if (!Number.isFinite(threshold.to) || threshold.to <= from || threshold.to > max)
      throw new RangeError('Gauge thresholds must increase strictly within (min, max]');
    ids.add(threshold.id);
    segments.push({
      id: threshold.id,
      label: threshold.label,
      to: threshold.to,
      from,
      index: segments.length,
      startAngle: angle(from),
      endAngle: angle(threshold.to),
    });
    from = threshold.to;
  }
  if (segments.length && from !== max)
    throw new RangeError('The last Gauge threshold must end at max');
  const ratio = value === null ? null : linearFraction(value, [min, max]);
  const needle = value === null ? null : { x: Math.cos(angle(value)), y: Math.sin(angle(value)) };
  const active =
    value === null
      ? undefined
      : (segments.find((segment) => value < segment.to) ?? segments.at(-1));
  return {
    value,
    min,
    max,
    variant,
    ratio,
    needle,
    startAngle,
    endAngle: startAngle + sweep,
    segments,
    activeSegmentId: active?.id ?? null,
  };
}
