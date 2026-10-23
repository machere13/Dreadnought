import { useMemo } from 'react';
import { buildHistogram, type HistogramOptions } from '@dreadnought/core';
import { BarChartAdapter } from '../BarChart/BarChartAdapter.tsx';
import type { BarChartAdapterProps } from '../BarChart/barChart.types.ts';

export type HistogramAdapterProps = Omit<
  BarChartAdapterProps,
  | 'categories'
  | 'series'
  | 'domain'
  | 'orientation'
  | 'gapRatio'
  | 'visibleSeries'
  | 'defaultVisibleSeries'
  | 'onVisibleSeriesChange'
  | 'formatValue'
  | 'formatTick'
  | 'width'
  | 'height'
> &
  HistogramOptions & {
    formatBoundary?: (value: number) => string;
  } & ({ width: number; height: number } | { width?: undefined; height?: undefined });

const visibleSeries = ['histogram'];

export function HistogramAdapter({
  data,
  bins,
  domain,
  formatBoundary = String,
  categoryLabel = 'Интервал',
  valueLabel = 'Наблюдения',
  minCategorySize = 96,
  slotProps = {},
  ...props
}: HistogramAdapterProps) {
  const layout = useMemo(() => buildHistogram({ data, bins, domain }), [data, bins, domain]);
  if (typeof formatBoundary !== 'function') {
    throw new TypeError('Histogram boundary formatter must be a function');
  }
  const categories = useMemo(
    () =>
      layout.bins.map((bin, index) => ({
        id: String(index),
        label: `[${formatBoundary(bin.lower)}; ${formatBoundary(bin.upper)}${bin.inclusiveUpper ? ']' : ')'}`,
      })),
    [layout, formatBoundary],
  );
  const series = useMemo(
    () => [
      {
        id: 'histogram',
        label: valueLabel,
        values: Object.fromEntries(layout.bins.map((bin, index) => [String(index), bin.count])),
      },
    ],
    [layout, valueLabel],
  );
  const maximum = Math.max(1, ...layout.bins.map((bin) => bin.count));
  return (
    <BarChartAdapter
      {...props}
      categories={categories}
      series={series}
      domain={[0, Math.ceil(maximum / 4) * 4]}
      categoryLabel={categoryLabel}
      valueLabel={valueLabel}
      formatTick={String}
      formatValue={(value) =>
        `${value} (${layout.total ? Math.round((value / layout.total) * 1000) / 10 : 0}%)`
      }
      orientation="vertical"
      gapRatio={0}
      minCategorySize={minCategorySize}
      visibleSeries={visibleSeries}
      slotProps={{
        ...slotProps,
        legend: { ...slotProps.legend, hidden: true, style: { display: 'none' } },
      }}
    />
  );
}
