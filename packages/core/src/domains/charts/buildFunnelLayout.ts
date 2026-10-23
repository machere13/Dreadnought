export interface FunnelDatum {
  id: string;
  label: string;
  value: number;
}

export interface FunnelLayoutOptions {
  data: readonly FunnelDatum[];
}

export interface FunnelStage extends FunnelDatum {
  width: number;
  nextWidth: number;
  fromFirst: number | null;
  fromPrevious: number | null;
  drop: number | null;
}

export interface FunnelLayout {
  stages: FunnelStage[];
}

export function buildFunnelLayout({ data }: FunnelLayoutOptions): FunnelLayout {
  if (!Array.isArray(data)) throw new TypeError('Funnel data must be an array');
  const ids = new Set<string>();
  const items = Array.from(data, (item, index) => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      typeof item.label !== 'string' ||
      !item.label.trim() ||
      !Number.isFinite(item.value)
    ) {
      throw new TypeError('Funnel stages require nonempty id/label and finite value');
    }
    if (ids.has(item.id)) throw new RangeError('Funnel stage IDs must be unique');
    if (item.value < 0 || (index > 0 && item.value > data[index - 1].value)) {
      throw new RangeError('Funnel values must be nonnegative and nonincreasing');
    }
    ids.add(item.id);
    return { id: item.id, label: item.label, value: item.value };
  });
  const first = items[0]?.value ?? 0;
  return {
    stages: items.map((item, index) => {
      const previous = items[index - 1]?.value;
      const next = items[index + 1]?.value ?? item.value;
      return {
        ...item,
        width: first > 0 ? item.value / first : 0,
        nextWidth: first > 0 ? next / first : 0,
        fromFirst: first > 0 ? item.value / first : null,
        fromPrevious: previous > 0 ? item.value / previous : null,
        drop: previous === undefined ? null : previous - item.value,
      };
    }),
  };
}
