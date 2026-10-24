import { useId, useMemo } from 'react';
import { buildHeatmapLayout } from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { useChartPage } from '../../shared/useChartPage.tsx';
import { HeatmapContext } from './HeatmapContext.tsx';
import {
  HeatmapPlotAdapter,
  HeatmapLegendAdapter,
  HeatmapTableAdapter,
  HeatmapPaginationAdapter,
  HeatmapEmptyAdapter,
} from './HeatmapParts.tsx';
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

function HeatmapRootAdapter({
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
  children,
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
  const page = useChartPage(layout.cells, pageSize);
  return (
    <figure
      {...native(rest, ['role'])}
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
      data-ui="heatmap"
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <HeatmapContext.Provider
        value={{ layout, hasValues, label, labels, formatValue, showValues, slotProps, page }}
      >
        {children === undefined ? (
          <>
            <HeatmapPlotAdapter />
            <HeatmapEmptyAdapter />
            <HeatmapLegendAdapter />
            <HeatmapTableAdapter />
            <HeatmapPaginationAdapter />
          </>
        ) : (
          children
        )}
      </HeatmapContext.Provider>
    </figure>
  );
}

export const HeatmapAdapter = Object.assign(HeatmapRootAdapter, {
  Plot: HeatmapPlotAdapter,
  Legend: HeatmapLegendAdapter,
  Table: HeatmapTableAdapter,
  Pagination: HeatmapPaginationAdapter,
  Empty: HeatmapEmptyAdapter,
});
