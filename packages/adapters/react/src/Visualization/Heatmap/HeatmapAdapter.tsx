import { useId, useMemo } from 'react';
import { buildHeatmapLayout } from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { HeatmapGrid } from './HeatmapGrid.tsx';
import { HeatmapDataTable } from './HeatmapDataTable.tsx';
import type { HeatmapAdapterProps, HeatmapLabels } from './heatmap.types.ts';

const defaults: Required<HeatmapLabels> = {
  column: 'Столбец',
  row: 'Строка',
  value: 'Значение',
  missing: 'Нет данных',
  empty: 'Нет значений для отображения',
  legend: 'Цветовая шкала',
  dataTable: 'Все данные',
};

export function HeatmapAdapter({
  columns,
  rows,
  data,
  domain,
  label,
  description,
  formatValue = String,
  showValues = true,
  pageSize = 50,
  labels: customLabels = {},
  slotProps = {},
  ...rest
}: HeatmapAdapterProps) {
  const layout = useMemo(
    () => buildHeatmapLayout({ columns, rows, data, domain }),
    [columns, rows, data, domain?.[0], domain?.[1]],
  );
  const labels = { ...defaults, ...customLabels };
  if (
    [label, ...Object.values(labels)].some((value) => typeof value !== 'string' || !value.trim())
  ) {
    throw new TypeError('Heatmap labels must be nonempty strings');
  }
  if (description !== undefined && typeof description !== 'string') {
    throw new TypeError('Heatmap description must be a string');
  }
  if (typeof formatValue !== 'function')
    throw new TypeError('Heatmap formatter must be a function');
  const id = useId();
  const hasValues = layout.cells.some((cell) => cell.value !== null);
  return (
    <figure
      {...native(rest, ['role'])}
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
      data-ui="heatmap"
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <HeatmapGrid
        layout={layout}
        labels={labels}
        label={label}
        formatValue={formatValue}
        showValues={showValues}
        slotProps={slotProps}
      />
      {!hasValues && <p>{labels.empty}</p>}
      {layout.domain && hasValues && (
        <div
          {...native(slotProps.legend)}
          role="group"
          aria-label={labels.legend}
          data-ui="heatmap-legend"
        >
          <span>{labels.value}</span>
          <span>{formatValue(layout.domain[0])}</span>
          <span
            {...native(slotProps.scale)}
            aria-hidden="true"
            data-ui="heatmap-scale"
            data-constant={layout.domain[0] === layout.domain[1] || undefined}
          />
          {layout.domain[0] !== layout.domain[1] && <span>{formatValue(layout.domain[1])}</span>}
        </div>
      )}
      <HeatmapDataTable
        cells={layout.cells}
        label={label}
        labels={labels}
        formatValue={formatValue}
        slotProps={slotProps}
        pageSize={pageSize}
      />
    </figure>
  );
}
