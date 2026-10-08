export interface RadarMetric {
  id: string;
  label: string;
  domain: readonly [number, number];
  reverse?: boolean;
}

export interface RadarSeries {
  id: string;
  label: string;
  values: Readonly<Record<string, number>>;
}

export interface RadarLayoutOptions {
  metrics: readonly RadarMetric[];
  series: readonly RadarSeries[];
  radius: number;
}

export interface RadarLayout {
  axes: Array<{
    id: string;
    label: string;
    domain: [number, number];
    reverse: boolean;
    angle: number;
    x: number;
    y: number;
  }>;
  seriesPoints: Array<{
    id: string;
    label: string;
    points: Array<{
      metricId: string;
      value: number;
      normalizedValue: number;
      x: number;
      y: number;
    }>;
  }>;
}

function validateIdentity(item: { id: string; label: string }, ids: Set<string>) {
  if (
    !item ||
    typeof item !== 'object' ||
    Array.isArray(item) ||
    typeof item.id !== 'string' ||
    !item.id.trim() ||
    typeof item.label !== 'string'
  ) {
    throw new TypeError('Radar entries require a nonempty string id and a string label.');
  }
  if (ids.has(item.id)) {
    throw new RangeError(`Duplicate Radar id: ${item.id}`);
  }
  ids.add(item.id);
}

export function buildRadarLayout(options: RadarLayoutOptions): RadarLayout {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Radar options must be an object.');
  }
  const { metrics, series, radius } = options;
  if (!Array.isArray(metrics) || !Array.isArray(series)) {
    throw new TypeError('Radar metrics and series must be arrays.');
  }
  if (!Number.isFinite(radius)) {
    throw new TypeError('Radar radius must be a finite number.');
  }
  if (radius <= 0 || metrics.length < 3) {
    throw new RangeError('Radar requires a positive radius and at least three metrics.');
  }
  const metricIds = new Set<string>();
  const seriesIds = new Set<string>();
  const axes = Array.from(metrics, (metric, index): RadarLayout['axes'][number] => {
    validateIdentity(metric, metricIds);
    if (
      !Array.isArray(metric.domain) ||
      metric.domain.length !== 2 ||
      ![metric.domain[0], metric.domain[1]].every(Number.isFinite)
    ) {
      throw new TypeError('Radar domain must contain two finite numbers.');
    }
    if (metric.domain[0] >= metric.domain[1]) {
      throw new RangeError('Radar domain requires min < max.');
    }
    if (metric.reverse !== undefined && typeof metric.reverse !== 'boolean') {
      throw new TypeError('Radar reverse must be boolean.');
    }
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / metrics.length;
    return {
      id: metric.id,
      label: metric.label,
      domain: [metric.domain[0], metric.domain[1]],
      reverse: metric.reverse ?? false,
      angle,
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });
  const seriesPoints = Array.from(series, (item) => {
    validateIdentity(item, seriesIds);
    if (!item.values || typeof item.values !== 'object' || Array.isArray(item.values)) {
      throw new TypeError('Radar values must be an object.');
    }
    return {
      id: item.id,
      label: item.label,
      points: axes.map((axis) => {
        const [min, max] = axis.domain;
        const value = item.values[axis.id];
        if (!Object.hasOwn(item.values, axis.id) || !Number.isFinite(value)) {
          throw new TypeError(`Missing or nonfinite Radar value: ${axis.id}`);
        }
        if (value < min || value > max) {
          throw new RangeError(`Radar value is outside its domain: ${axis.id}`);
        }
        const span = max - min;
        const t = Number.isFinite(span)
          ? (value - min) / span
          : (value / 2 - min / 2) / (max / 2 - min / 2);
        const normalizedValue = axis.reverse ? 1 - t : t;
        const distance = radius * normalizedValue;
        return {
          metricId: axis.id,
          value,
          normalizedValue,
          x: distance * Math.cos(axis.angle),
          y: distance * Math.sin(axis.angle),
        };
      }),
    };
  });
  return { axes, seriesPoints };
}
