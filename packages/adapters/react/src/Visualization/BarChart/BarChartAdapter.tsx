import { BarChartContext } from './BarChartContext.tsx';
import {
  BarChartPlotAdapter,
  BarChartLegendAdapter,
  BarChartTableAdapter,
  BarChartPaginationAdapter,
  BarChartEmptyAdapter,
} from './BarChartParts.tsx';
import { useId, useMemo } from 'react';
import { buildBarLayout } from '@dreadnought/core';
import { useSeriesVisibility } from '../../shared/useSeriesVisibility.ts';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import type { BarChartAdapterProps } from './barChart.types.ts';
import { useChartPage } from '../../shared/useChartPage.tsx';

function BarChartRootAdapter({
  label,
  description,
  categories,
  series,
  domain,
  orientation,
  gapRatio,
  width,
  height,
  categoryLabel = 'Категория',
  valueLabel = 'Значение',
  formatValue = String,
  formatTick = formatValue,
  visibleSeries,
  defaultVisibleSeries,
  onVisibleSeriesChange,
  pageSize = 50,
  minCategorySize = 64,
  labels = {},
  slotProps = {},
  children,
  ...native
}: BarChartAdapterProps) {
  const source = useMemo(
    () =>
      buildBarLayout({ categories, series, domain, orientation, gapRatio, width: 1, height: 1 }),
    [categories, series, domain[0], domain[1], orientation, gapRatio],
  );
  if (!Number.isFinite(minCategorySize) || minCategorySize <= 0) {
    throw new RangeError('Category size must be finite and positive');
  }
  const page = useChartPage(categories, pageSize);
  if (
    [label, categoryLabel, valueLabel, ...Object.values(labels)].some(
      (value) => typeof value !== 'string' || !value.trim(),
    )
  ) {
    throw new TypeError('Bar labels must be nonempty strings');
  }
  if (description !== undefined && typeof description !== 'string') {
    throw new TypeError('Bar description must be a string');
  }
  if (typeof formatValue !== 'function' || typeof formatTick !== 'function') {
    throw new TypeError('Bar formatters must be functions');
  }
  if (width !== undefined || height !== undefined) {
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      throw new TypeError('Bar requires finite dimensions together');
    }
    if (width! <= 0 || height! <= 0) {
      throw new RangeError('Bar dimensions must be positive');
    }
  }
  for (const value of [visibleSeries, defaultVisibleSeries]) {
    if (value !== undefined) {
      if (!Array.isArray(value) || value.some((id) => typeof id !== 'string')) {
        throw new TypeError('Bar visibility must be an array of strings');
      }
      if (new Set(value).size !== value.length) {
        throw new RangeError('Bar visibility must contain unique IDs');
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
    categories,
    domain,
    orientation,
    gapRatio,
    categoryLabel,
    valueLabel,
    formatValue,
    formatTick,
    minCategorySize,
  };
  return (
    <figure
      {...nativeProps(native, ['role'])}
      aria-labelledby={`${id}-label`}
      aria-describedby={description !== undefined ? `${id}-description` : undefined}
      data-ui="bar-chart"
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <BarChartContext.Provider value={context}>
        {children === undefined ? (
          <>
            <BarChartPlotAdapter />
            <BarChartLegendAdapter />
            <BarChartTableAdapter />
            <BarChartPaginationAdapter />
            <BarChartEmptyAdapter />
          </>
        ) : (
          children
        )}
      </BarChartContext.Provider>
    </figure>
  );
}

export const BarChartAdapter = Object.assign(BarChartRootAdapter, {
  Plot: BarChartPlotAdapter,
  Legend: BarChartLegendAdapter,
  Table: BarChartTableAdapter,
  Pagination: BarChartPaginationAdapter,
  Empty: BarChartEmptyAdapter,
});
