export type PieDatum = { id: string; label: string; value: number };
export type PieLayoutOptions = {
  data: readonly PieDatum[];
  radius: number;
  innerRadius?: number;
};
export type PieSlice = PieDatum & {
  share: number;
  startAngle: number;
  endAngle: number;
};
export type PieLayout = {
  total: number;
  radius: number;
  innerRadius: number;
  slices: PieSlice[];
};

export function buildPieLayout(options: PieLayoutOptions): PieLayout {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Pie options must be an object');
  }
  const { data, radius, innerRadius = 0 } = options;
  if (!Array.isArray(data)) {
    throw new TypeError('Pie data must be an array');
  }
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new RangeError('Pie radius must be finite and positive');
  }
  if (!Number.isFinite(innerRadius) || innerRadius < 0 || innerRadius >= 1) {
    throw new RangeError('Pie innerRadius must be a ratio in [0, 1)');
  }
  const ids = new Set<string>();
  let total = 0;
  for (const item of data) {
    if (!item || typeof item.id !== 'string' || !item.id.trim() || typeof item.label !== 'string') {
      throw new TypeError('Pie items require a nonempty ID and a string label');
    }
    if (ids.has(item.id)) {
      throw new RangeError('Pie IDs must be unique');
    }
    if (!Number.isFinite(item.value) || item.value < 0) {
      throw new RangeError('Pie values must be finite and nonnegative');
    }
    ids.add(item.id);
    total += item.value;
  }
  if (!Number.isFinite(total)) {
    throw new RangeError('Pie total must be finite');
  }
  let accumulated = 0;
  const slices = data
    .filter((item) => item.value > 0)
    .map((item) => {
      const startAngle = (accumulated / total) * Math.PI * 2 - Math.PI / 2;
      accumulated += item.value;
      return {
        id: item.id,
        label: item.label,
        value: item.value,
        share: item.value / total,
        startAngle,
        endAngle: (accumulated / total) * Math.PI * 2 - Math.PI / 2,
      };
    });
  return { total, radius, innerRadius: radius * innerRadius, slices };
}
