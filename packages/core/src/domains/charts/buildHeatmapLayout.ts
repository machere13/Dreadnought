import { linearFraction, validateLinearDomain } from './linearScale.ts';

export interface HeatmapCategory {
  id: string;
  label: string;
}

export interface HeatmapDatum {
  column: string;
  row: string;
  value: number | null;
}

export interface HeatmapLayoutOptions {
  columns: readonly HeatmapCategory[];
  rows: readonly HeatmapCategory[];
  data: readonly HeatmapDatum[];
  domain?: readonly [number, number];
}

export interface HeatmapCell {
  id: string;
  column: HeatmapCategory;
  row: HeatmapCategory;
  columnIndex: number;
  rowIndex: number;
  value: number | null;
  intensity: number | null;
}

export interface HeatmapLayout {
  columns: HeatmapCategory[];
  rows: HeatmapCategory[];
  cells: HeatmapCell[];
  domain: [number, number] | null;
}

function copyCategories(categories: readonly HeatmapCategory[]) {
  if (!Array.isArray(categories)) throw new TypeError('Heatmap categories must be arrays');
  const ids = new Set<string>();
  return categories.map((category) => {
    if (
      !category ||
      typeof category.id !== 'string' ||
      !category.id.trim() ||
      typeof category.label !== 'string'
    ) {
      throw new TypeError('Heatmap categories require a nonempty ID and a label');
    }
    if (ids.has(category.id)) throw new RangeError('Heatmap category IDs must be unique per axis');
    ids.add(category.id);
    return { ...category };
  });
}

export function buildHeatmapLayout(options: HeatmapLayoutOptions): HeatmapLayout {
  if (!options || typeof options !== 'object') throw new TypeError('Heatmap options required');
  const columns = copyCategories(options.columns);
  const rows = copyCategories(options.rows);
  if (!Array.isArray(options.data)) throw new TypeError('Heatmap data must be an array');
  if (options.domain !== undefined) validateLinearDomain(options.domain);
  const columnIds = new Set(columns.map((column) => column.id));
  const rowIds = new Set(rows.map((row) => row.id));
  const values = new Map<string, number | null>();
  let min = Infinity;
  let max = -Infinity;
  for (const datum of options.data) {
    if (!datum || !columnIds.has(datum.column) || !rowIds.has(datum.row)) {
      throw new RangeError('Heatmap coordinates must reference known categories');
    }
    if (datum.value !== null && !Number.isFinite(datum.value)) {
      throw new TypeError('Heatmap values must be finite numbers or null');
    }
    const key = JSON.stringify([datum.row, datum.column]);
    if (values.has(key)) throw new RangeError('Heatmap coordinates must be unique');
    values.set(key, datum.value);
    if (datum.value !== null) {
      if (options.domain && (datum.value < options.domain[0] || datum.value > options.domain[1])) {
        throw new RangeError('Heatmap values must be inside the domain');
      }
      min = Math.min(min, datum.value);
      max = Math.max(max, datum.value);
    }
  }
  const domain: [number, number] | null = options.domain
    ? [...options.domain]
    : min === Infinity
      ? null
      : [min, max];
  const cells = rows.flatMap((row, rowIndex) =>
    columns.map((column, columnIndex) => {
      const id = JSON.stringify([row.id, column.id]);
      const value = values.get(id) ?? null;
      const intensity =
        value === null || domain === null
          ? null
          : domain[0] === domain[1]
            ? 0.5
            : linearFraction(value, domain);
      return { id, column, row, columnIndex, rowIndex, value, intensity };
    }),
  );
  return { columns, rows, cells, domain };
}
