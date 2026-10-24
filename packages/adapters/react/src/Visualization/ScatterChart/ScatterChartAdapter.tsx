import { ScatterChartContext } from './ScatterChartContext.tsx';
import {
  ScatterChartPlotAdapter,
  ScatterChartLegendAdapter,
  ScatterChartTableAdapter,
  ScatterChartPaginationAdapter,
  ScatterChartEmptyAdapter,
} from './ScatterChartParts.tsx';
import { useChartPage } from '../../shared/useChartPage.tsx';
import { useId, useMemo } from 'react';
import { buildScatterLayout } from '@dreadnought/core';
import { useSeriesVisibility } from '../../shared/useSeriesVisibility.ts';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { ScatterChartAdapterProps } from './scatterChart.types.ts';

function ScatterChartRootAdapter({
  label,
  description,
  series,
  xDomain,
  yDomain,
  width,
  height,
  pointRadius = 5,
  maxBubbleRadius = 24,
  xLabel = 'X',
  yLabel = 'Y',
  sizeLabel = 'Размер',
  formatX = String,
  formatY = String,
  formatSize = String,
  visibleSeries,
  defaultVisibleSeries,
  onVisibleSeriesChange,
  pageSize = 50,
  labels = {},
  slotProps = {},
  children,
  ...rest
}: ScatterChartAdapterProps) {
  const source = useMemo(
    () =>
      buildScatterLayout({
        series,
        xDomain,
        yDomain,
        width: 1,
        height: 1,
        pointRadius,
        maxBubbleRadius,
      }),
    [series, xDomain[0], xDomain[1], yDomain[0], yDomain[1], pointRadius, maxBubbleRadius],
  );
  if (
    [label, xLabel, yLabel, sizeLabel, ...Object.values(labels)].some(
      (value) => typeof value !== 'string' || !value.trim(),
    )
  ) {
    throw new TypeError('Scatter labels must be nonempty strings');
  }
  if (description !== undefined && typeof description !== 'string')
    throw new TypeError('Scatter description must be a string');
  if ([formatX, formatY, formatSize].some((value) => typeof value !== 'function'))
    throw new TypeError('Scatter formatters must be functions');
  if (width !== undefined || height !== undefined) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width! <= 0 || height! <= 0)
      throw new RangeError('Scatter requires positive finite dimensions together');
  }
  for (const value of [visibleSeries, defaultVisibleSeries]) {
    if (
      value !== undefined &&
      (!Array.isArray(value) ||
        value.some((id) => typeof id !== 'string') ||
        new Set(value).size !== value.length)
    ) {
      throw new TypeError('Scatter visibility requires unique string IDs');
    }
  }
  const id = useId();
  const { visible, toggle } = useSeriesVisibility(
    series,
    visibleSeries,
    defaultVisibleSeries,
    onVisibleSeriesChange,
  );
  const rows = useMemo(() => source.series.flatMap((item) => item.points), [source]);
  const names = useMemo(
    () => new Map(series.map((item) => [item.id, item.label || item.id])),
    [series],
  );
  const page = useChartPage(rows, pageSize);
  const hasSize = rows.some((point) => point.value.size !== undefined);
  const format = { xLabel, yLabel, sizeLabel, formatX, formatY, formatSize };
  const hasVisiblePoints = rows.some(
    (point) => point.radius > 0 && visible.includes(point.seriesId),
  );
  const context = {
    series,
    label,
    width,
    height,
    source,
    rows,
    seriesNames: names,
    visible,
    page,
    hasSize,
    hasVisiblePoints,
    format,
    labels,
    slotProps,
    toggle: (id: string) => {
      if (series.some((item) => item.id === id)) toggle(id);
    },
  };
  return (
    <figure
      {...native(rest, ['role'])}
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
      data-ui="scatter-chart"
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <ScatterChartContext.Provider value={context}>
        {children === undefined ? (
          <>
            <ScatterChartPlotAdapter />
            <ScatterChartEmptyAdapter />
            <ScatterChartLegendAdapter />
            <ScatterChartTableAdapter />
            <ScatterChartPaginationAdapter />
          </>
        ) : (
          children
        )}
      </ScatterChartContext.Provider>
    </figure>
  );
}

export const ScatterChartAdapter = Object.assign(ScatterChartRootAdapter, {
  Plot: ScatterChartPlotAdapter,
  Legend: ScatterChartLegendAdapter,
  Table: ScatterChartTableAdapter,
  Pagination: ScatterChartPaginationAdapter,
  Empty: ScatterChartEmptyAdapter,
});
