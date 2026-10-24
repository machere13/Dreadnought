import { useCallback, useRef } from 'react';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { ChartPagination } from '../../shared/useChartPage.tsx';
import { attachRef } from '../../shared/attachRef.ts';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import { TableAdapter } from '../../DataDisplay/Table/TableAdapter.tsx';
import { BarPlot } from './BarPlot.tsx';
import { useBarChart } from './BarChartContext.tsx';
import type { BarChartPlotProps, BarChartLegendProps } from './barChart.types.ts';

export function BarChartPlotAdapter(props: BarChartPlotProps) {
  const context = useBarChart();
  const { width, height, slotProps } = context;
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
    <div {...nativeProps(slotProps.plotContainer)} ref={attachPlot} data-ui="bar-plot-container">
      {viewport && <BarPlot {...context} {...viewport} {...props} />}
    </div>
  );
}

export function BarChartLegendAdapter({ children }: BarChartLegendProps) {
  const { series, visible, toggle, labels, slotProps } = useBarChart();
  return (
    <div
      {...nativeProps(slotProps.legend)}
      role="group"
      aria-label={labels.legend ?? 'Серии'}
      data-ui="bar-legend"
    >
      {series.map((item) => {
        const slot = nativeProps(slotProps.legendButton?.(item), [
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
            data-ui="bar-legend-button"
            data-series-id={item.id}
            onClick={(event) => {
              slot.onClick?.(event);
              if (!event.defaultPrevented) {
                toggle(item.id);
              }
            }}
          >
            {children
              ? children({
                  series: item,
                  visible: visible.includes(item.id),
                  defaultContent: item.label || item.id,
                })
              : item.label || item.id}
          </button>
        );
      })}
    </div>
  );
}

export function BarChartTableAdapter() {
  const { label, series, page, categoryLabel, valueLabel, formatValue, labels, slotProps } =
    useBarChart();
  return (
    <TableAdapter {...nativeProps(slotProps.table, ['role', 'aria-hidden', 'hidden'])}>
      <caption>
        {label}: {labels.dataTable ?? 'Данные'}
      </caption>
      <TableAdapter.Head>
        <TableAdapter.Row>
          <TableAdapter.HeaderCell scope="col">{categoryLabel}</TableAdapter.HeaderCell>
          {series.map((item) => (
            <TableAdapter.HeaderCell key={item.id} scope="col">
              {item.label || item.id}
              {(item.label || item.id) !== valueLabel && ` (${valueLabel})`}
            </TableAdapter.HeaderCell>
          ))}
        </TableAdapter.Row>
      </TableAdapter.Head>
      <TableAdapter.Body>
        {page.rows.map((category) => (
          <TableAdapter.Row key={category.id}>
            <TableAdapter.HeaderCell scope="row">
              {category.label || category.id}
            </TableAdapter.HeaderCell>
            {series.map((item) => {
              const value = Object.hasOwn(item.values, category.id)
                ? item.values[category.id]
                : null;
              return (
                <TableAdapter.Cell key={item.id}>
                  {value == null ? '—' : formatValue(value)}
                </TableAdapter.Cell>
              );
            })}
          </TableAdapter.Row>
        ))}
      </TableAdapter.Body>
    </TableAdapter>
  );
}

export function BarChartPaginationAdapter() {
  const { page, slotProps } = useBarChart();
  return <ChartPagination {...page} slotProps={slotProps} />;
}

export function BarChartEmptyAdapter() {
  const { categories, labels } = useBarChart();
  return categories.length === 0 ? <p>{labels.empty ?? 'Нет данных'}</p> : null;
}
