import { LineChartContext } from './LineChartContext.tsx';
import {
  LineChartPlotAdapter,
  LineChartLegendAdapter,
  LineChartTableAdapter,
  LineChartPaginationAdapter,
  LineChartEmptyAdapter,
  LineChartRangeControlsAdapter,
} from './LineChartParts.tsx';
import { useId, useMemo, useState } from 'react';
import { buildLineLayout } from '@dreadnought/core';
import { useSeriesVisibility } from '../../shared/useSeriesVisibility.ts';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import type { LineChartAdapterProps } from './lineChart.types.ts';
import { useChartPage } from '../../shared/useChartPage.tsx';

function LineChartRootAdapter({
  label,
  description,
  series,
  xDomain,
  yDomain,
  width,
  height,
  xLabel = 'X',
  yLabel = 'Y',
  formatX = String,
  formatY = String,
  visibleSeries,
  defaultVisibleSeries,
  onVisibleSeriesChange,
  pageSize = 50,
  zoom = true,
  labels = {},
  slotProps = {},
  children,
  ...native
}: LineChartAdapterProps) {
  const source = useMemo(
    () => buildLineLayout({ series, xDomain, yDomain, width: 1, height: 1 }),
    [series, xDomain[0], xDomain[1], yDomain[0], yDomain[1]],
  );
  if (
    [label, xLabel, yLabel, ...Object.values(labels)].some(
      (value) => typeof value !== 'string' || !value.trim(),
    )
  ) {
    throw new TypeError('Line labels must be nonempty strings');
  }
  if (description !== undefined && typeof description !== 'string') {
    throw new TypeError('Line description must be a string');
  }
  if (typeof formatX !== 'function' || typeof formatY !== 'function') {
    throw new TypeError('Line formatters must be functions');
  }
  if (width !== undefined || height !== undefined) {
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      throw new TypeError('Line requires finite dimensions together');
    }
    if (width! <= 0 || height! <= 0) {
      throw new RangeError('Line dimensions must be positive');
    }
  }
  for (const value of [visibleSeries, defaultVisibleSeries]) {
    if (value !== undefined) {
      if (!Array.isArray(value) || value.some((id) => typeof id !== 'string')) {
        throw new TypeError('Line visibility must be an array of strings');
      }
      if (new Set(value).size !== value.length) {
        throw new RangeError('Line visibility must contain unique IDs');
      }
    }
  }
  const id = useId();
  const { visible, toggle } = useSeriesVisibility(
    series,
    visibleSeries,
    defaultVisibleSeries,
    onVisibleSeriesChange,
  );
  const xs = useMemo(
    () =>
      [...new Set(series.flatMap((item) => item.data.map((point) => point.x)))].sort(
        (a, b) => a - b,
      ),
    [series],
  );
  const values = useMemo(
    () =>
      new Map(
        series.map((item) => [item.id, new Map(item.data.map((point) => [point.x, point.y]))]),
      ),
    [series],
  );
  const page = useChartPage(xs, pageSize);
  const [range, setRange] = useState({ xs, start: 0, end: xs.length - 1 });
  const start = range.xs === xs ? Math.min(range.start, Math.max(0, xs.length - 2)) : 0;
  const end =
    range.xs === xs ? Math.max(start + 1, Math.min(range.end, xs.length - 1)) : xs.length - 1;
  const activeDomain: readonly [number, number] =
    zoom && xs.length > 1 && (start !== 0 || end !== xs.length - 1)
      ? [xs[start], xs[end]]
      : xDomain;
  const context = {
    label,
    series,
    width,
    height,
    visible,
    toggle: (id: string) => {
      if (series.some((item) => item.id === id)) toggle(id);
    },
    page,
    labels,
    slotProps,
    source,
    values,
    xs,
    xDomain: activeDomain,
    xLabel,
    yLabel,
    formatX,
    formatY,
    zoom,
    range: {
      start,
      end,
      change: (nextStart: number, nextEnd: number) => {
        if (
          zoom &&
          Number.isInteger(nextStart) &&
          Number.isInteger(nextEnd) &&
          nextStart >= 0 &&
          nextStart < nextEnd &&
          nextEnd < xs.length
        )
          setRange({ xs, start: nextStart, end: nextEnd });
      },
    },
  };
  return (
    <figure
      {...nativeProps(native, ['role'])}
      aria-labelledby={`${id}-label`}
      aria-describedby={description !== undefined ? `${id}-description` : undefined}
      data-ui="line-chart"
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <LineChartContext.Provider value={context}>
        {children === undefined ? (
          <>
            <LineChartPlotAdapter />
            <LineChartRangeControlsAdapter />
            <LineChartLegendAdapter />
            <LineChartTableAdapter />
            <LineChartPaginationAdapter />
            <LineChartEmptyAdapter />
          </>
        ) : (
          children
        )}
      </LineChartContext.Provider>
    </figure>
  );
}

export const LineChartAdapter = Object.assign(LineChartRootAdapter, {
  Plot: LineChartPlotAdapter,
  Legend: LineChartLegendAdapter,
  Table: LineChartTableAdapter,
  Pagination: LineChartPaginationAdapter,
  Empty: LineChartEmptyAdapter,
  RangeControls: LineChartRangeControlsAdapter,
});
