import { PieChartContext } from './PieChartContext.tsx';
import {
  PieChartPlotAdapter,
  PieChartLegendAdapter,
  PieChartTableAdapter,
  PieChartEmptyAdapter,
} from './PieChartParts.tsx';
import { useId, useMemo } from 'react';
import { buildPieLayout } from '@dreadnought/core';
import { useSeriesVisibility } from '../../shared/useSeriesVisibility.ts';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { PieChartAdapterProps, PieChartLabels } from './pieChart.types.ts';

const defaults: PieChartLabels = {
  legend: 'Категории',
  dataTable: 'Все исходные данные',
  category: 'Категория',
  value: 'Значение',
  empty: 'Нет положительных значений для отображения',
};
function PieChartRootAdapter({
  data,
  label,
  description,
  innerRadius = 0,
  width,
  height,
  visibleItems,
  defaultVisibleItems,
  onVisibleItemsChange,
  labels: customLabels,
  slotProps = {},
  children,
  ...rest
}: PieChartAdapterProps) {
  const source = useMemo(
    () => buildPieLayout({ data, radius: 100, innerRadius }),
    [data, innerRadius],
  );
  if (typeof label !== 'string' || !label.trim()) throw new TypeError('Pie label must be nonempty');
  if (description !== undefined && typeof description !== 'string')
    throw new TypeError('Pie description must be a string');
  if (width !== undefined || height !== undefined) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || !(width! > 0) || !(height! > 0)) {
      throw new RangeError('Pie requires finite positive width and height together');
    }
  }
  for (const visibility of [visibleItems, defaultVisibleItems]) {
    if (
      visibility !== undefined &&
      (!Array.isArray(visibility) ||
        Array.from(visibility).some((id) => typeof id !== 'string') ||
        new Set(visibility).size !== visibility.length)
    ) {
      throw new TypeError('Pie visibility must contain unique string IDs');
    }
  }
  if (
    customLabels !== undefined &&
    (!customLabels || typeof customLabels !== 'object' || Array.isArray(customLabels))
  ) {
    throw new TypeError('Pie labels must be an object');
  }
  const labels = { ...defaults, ...customLabels };
  if (Object.values(labels).some((value) => typeof value !== 'string' || !value.trim())) {
    throw new TypeError('Pie labels must be nonempty strings');
  }
  const id = useId();
  const { visible, toggle } = useSeriesVisibility(
    data,
    visibleItems,
    defaultVisibleItems,
    onVisibleItemsChange,
  );
  const layout = useMemo(() => {
    const visibleSet = new Set(visible);
    return buildPieLayout({
      data: data.filter((item) => visibleSet.has(item.id)),
      radius: 100,
      innerRadius,
    });
  }, [data, visible, innerRadius]);
  const context = {
    data,
    label,
    width,
    height,
    source,
    layout,
    visible,
    labels,
    slotProps,
    toggle: (id: string) => {
      if (data.some((item) => item.id === id)) toggle(id);
    },
  };
  return (
    <figure
      {...native(rest, ['role'])}
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
      data-ui="pie-chart"
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <PieChartContext.Provider value={context}>
        {children === undefined ? (
          <>
            <PieChartPlotAdapter />
            <PieChartEmptyAdapter />
            <PieChartLegendAdapter />
            <PieChartTableAdapter />
          </>
        ) : (
          children
        )}
      </PieChartContext.Provider>
    </figure>
  );
}

export const PieChartAdapter = Object.assign(PieChartRootAdapter, {
  Plot: PieChartPlotAdapter,
  Legend: PieChartLegendAdapter,
  Table: PieChartTableAdapter,
  Empty: PieChartEmptyAdapter,
});
