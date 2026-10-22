import { useCallback, useId, useMemo, useRef } from 'react';
import { buildScatterLayout } from '@dreadnought/core';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { useSeriesVisibility } from '../../shared/useSeriesVisibility.ts';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { ScatterPlot } from './ScatterPlot.tsx';
import { ScatterDataTable } from './ScatterDataTable.tsx';
import type { ScatterChartAdapterProps } from './scatterChart.types.ts';

export function ScatterChartAdapter({
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
  const plotRef = useRef<HTMLDivElement>(null);
  const consumerRef = slotProps.plotContainer?.ref;
  const attachPlot = useCallback(
    (element: HTMLDivElement | null) => {
      plotRef.current = element;
      if (element)
        return attachRef(element, consumerRef, () => {
          plotRef.current = null;
        });
    },
    [consumerRef],
  );
  const measured = useChartViewport(width, height, plotRef);
  const viewport = measured && { ...measured, height: height ?? Math.max(280, measured.height) };
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
  const format = { xLabel, yLabel, sizeLabel, formatX, formatY, formatSize };
  const hasVisiblePoints = rows.some(
    (point) => point.radius > 0 && visible.includes(point.seriesId),
  );
  return (
    <figure
      {...native(rest, ['role'])}
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
      data-ui="scatter-chart"
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <div {...native(slotProps.plotContainer)} ref={attachPlot} data-ui="scatter-plot-container">
        {viewport && (
          <ScatterPlot
            {...viewport}
            source={source}
            series={series}
            visible={visible}
            format={format}
            slotProps={slotProps}
          />
        )}
      </div>
      {!hasVisiblePoints && <p>{labels.empty ?? 'Нет точек для отображения'}</p>}
      <div
        {...native(slotProps.legend)}
        role="group"
        aria-label={labels.legend ?? 'Серии'}
        data-ui="scatter-legend"
      >
        {series.map((item) => {
          const slot = native(slotProps.legendButton?.(item), [
            'aria-label',
            'aria-labelledby',
            'disabled',
          ]);
          return (
            <button
              {...slot}
              key={item.id}
              type="button"
              aria-pressed={visible.includes(item.id)}
              data-ui="scatter-legend-button"
              data-series-id={item.id}
              onClick={(event) => {
                slot.onClick?.(event);
                if (!event.defaultPrevented) toggle(item.id);
              }}
            >
              {item.label || item.id}
            </button>
          );
        })}
      </div>
      <ScatterDataTable
        rows={rows}
        seriesNames={names}
        label={label}
        labels={labels}
        format={format}
        slotProps={slotProps}
        pageSize={pageSize}
      />
    </figure>
  );
}
