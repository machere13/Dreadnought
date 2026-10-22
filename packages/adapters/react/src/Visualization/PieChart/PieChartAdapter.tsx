import { useCallback, useId, useRef } from 'react';
import { buildPieLayout } from '@dreadnought/core';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { useSeriesVisibility } from '../../shared/useSeriesVisibility.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { PiePlot } from './PiePlot.tsx';
import type { PieChartAdapterProps, PieChartLabels } from './pieChart.types.ts';

const defaults: PieChartLabels = {
  legend: 'Категории',
  dataTable: 'Все исходные данные',
  category: 'Категория',
  value: 'Значение',
  empty: 'Нет положительных значений для отображения',
};
export function PieChartAdapter({
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
  ...rest
}: PieChartAdapterProps) {
  buildPieLayout({ data, radius: 100, innerRadius });
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
  const visibleSet = new Set(visible);
  const layout = buildPieLayout({
    data: data.filter((item) => visibleSet.has(item.id)),
    radius: 100,
    innerRadius,
  });
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
  const viewport = useChartViewport(width, height, plotRef);
  return (
    <figure
      {...native(rest, ['role'])}
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
      data-ui="pie-chart"
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <div {...native(slotProps.plotContainer)} ref={attachPlot} data-ui="pie-plot-container">
        {layout.slices.length === 0 ? (
          <p role="status">{labels.empty}</p>
        ) : (
          viewport && <PiePlot layout={layout} slotProps={slotProps} {...viewport} />
        )}
      </div>
      <div
        {...native(slotProps.legend)}
        role="group"
        aria-label={labels.legend}
        data-ui="pie-legend"
      >
        {data.map((item) => {
          const slot = native(slotProps.legendButton?.(item), [
            'disabled',
            'aria-label',
            'aria-labelledby',
          ]);
          return (
            <button
              {...slot}
              key={item.id}
              type="button"
              aria-pressed={visibleSet.has(item.id)}
              data-ui="pie-legend-button"
              data-item-id={item.id}
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
      <table {...native(slotProps.table, ['role', 'aria-hidden', 'hidden'])} data-ui="pie-table">
        <caption>
          {label} — {labels.dataTable}
        </caption>
        <thead>
          <tr>
            <th scope="col">{labels.category}</th>
            <th scope="col">{labels.value}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <th scope="row">{item.label || item.id}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
