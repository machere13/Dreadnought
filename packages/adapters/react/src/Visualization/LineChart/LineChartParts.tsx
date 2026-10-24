import { useCallback, useRef } from 'react';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { ChartPagination } from '../../shared/useChartPage.tsx';
import { attachRef } from '../../shared/attachRef.ts';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import { TableAdapter } from '../../DataDisplay/Table/TableAdapter.tsx';
import { LinePlot } from './LinePlot.tsx';
import { useLineChart } from './LineChartContext.tsx';
import type { LineChartPlotProps, LineChartLegendProps } from './lineChart.types.ts';

export function LineChartPlotAdapter(props: LineChartPlotProps) {
  const context = useLineChart();
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
    <div {...nativeProps(slotProps.plotContainer)} ref={attachPlot} data-ui="line-plot-container">
      {viewport && <LinePlot {...context} {...viewport} {...props} />}
    </div>
  );
}

export function LineChartLegendAdapter({ children }: LineChartLegendProps) {
  const { series, visible, toggle, labels, slotProps } = useLineChart();
  return (
    <div
      {...nativeProps(slotProps.legend)}
      role="group"
      aria-label={labels.legend ?? 'Серии'}
      data-ui="line-legend"
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
            data-ui="line-legend-button"
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

export function LineChartTableAdapter() {
  const { label, series, page, values, xLabel, yLabel, formatX, formatY, labels, slotProps } =
    useLineChart();
  return (
    <TableAdapter {...nativeProps(slotProps.table, ['role', 'aria-hidden', 'hidden'])}>
      <caption>
        {label}: {labels.dataTable ?? 'Данные'}
      </caption>
      <TableAdapter.Head>
        <TableAdapter.Row>
          <TableAdapter.HeaderCell scope="col">{xLabel}</TableAdapter.HeaderCell>
          {series.map((item) => (
            <TableAdapter.HeaderCell key={item.id} scope="col">
              {item.label || item.id} ({yLabel})
            </TableAdapter.HeaderCell>
          ))}
        </TableAdapter.Row>
      </TableAdapter.Head>
      <TableAdapter.Body>
        {page.rows.map((x) => (
          <TableAdapter.Row key={x}>
            <TableAdapter.HeaderCell scope="row">{formatX(x)}</TableAdapter.HeaderCell>
            {series.map((item) => {
              const value = values.get(item.id)?.get(x);
              return (
                <TableAdapter.Cell key={item.id}>
                  {value == null ? '—' : formatY(value)}
                </TableAdapter.Cell>
              );
            })}
          </TableAdapter.Row>
        ))}
      </TableAdapter.Body>
    </TableAdapter>
  );
}

export function LineChartPaginationAdapter() {
  const { page, slotProps } = useLineChart();
  return <ChartPagination {...page} slotProps={slotProps} />;
}

export function LineChartEmptyAdapter() {
  const { xs, labels } = useLineChart();
  return xs.length === 0 ? <p>{labels.empty ?? 'Нет данных'}</p> : null;
}

export function LineChartRangeControlsAdapter() {
  const { zoom, xs, range, formatX, slotProps } = useLineChart();
  const { start, end } = range;
  const rangeInput = nativeProps(slotProps.rangeInput);
  return (
    <>
      {zoom && xs.length > 1 && (
        <div {...nativeProps(slotProps.rangeControls)} data-ui="line-range-controls">
          <label>
            Начало: {formatX(xs[start])}
            <input
              {...rangeInput}
              type="range"
              min={0}
              max={xs.length - 2}
              value={start}
              aria-label="Начало диапазона"
              onChange={(event) => {
                rangeInput.onChange?.(event);
                if (!event.defaultPrevented) {
                  range.change(Math.min(Number(event.currentTarget.value), end - 1), end);
                }
              }}
            />
          </label>
          <label>
            Конец: {formatX(xs[end])}
            <input
              {...rangeInput}
              type="range"
              min={1}
              max={xs.length - 1}
              value={end}
              aria-label="Конец диапазона"
              onChange={(event) => {
                rangeInput.onChange?.(event);
                if (!event.defaultPrevented) {
                  range.change(start, Math.max(start + 1, Number(event.currentTarget.value)));
                }
              }}
            />
          </label>
        </div>
      )}
    </>
  );
}
