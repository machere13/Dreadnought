import { useCallback, useRef } from 'react';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { ChartPagination } from '../../shared/useChartPage.tsx';
import { ScatterDataTable } from './ScatterDataTable.tsx';
import { ScatterPlot } from './ScatterPlot.tsx';
import { useScatterChart } from './ScatterChartContext.tsx';
import type { ScatterChartPlotProps, ScatterChartLegendProps } from './scatterChart.types.ts';

export function ScatterChartPlotAdapter(props: ScatterChartPlotProps) {
  const context = useScatterChart();
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
  const measured = useChartViewport(width, height, plotRef);
  const viewport = measured && { ...measured, height: height ?? Math.max(280, measured.height) };
  return (
    <div {...native(slotProps.plotContainer)} ref={attachPlot} data-ui="scatter-plot-container">
      {viewport && <ScatterPlot {...context} {...viewport} {...props} />}
    </div>
  );
}
export function ScatterChartLegendAdapter({ children }: ScatterChartLegendProps) {
  const { series, visible, toggle, labels, slotProps } = useScatterChart();
  return (
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
export function ScatterChartTableAdapter() {
  const { page, seriesNames, label, labels, format, slotProps, hasSize } = useScatterChart();
  return (
    <ScatterDataTable
      rows={page.rows}
      seriesNames={seriesNames}
      label={label}
      labels={labels}
      format={format}
      slotProps={slotProps}
      hasSize={hasSize}
    />
  );
}

export function ScatterChartPaginationAdapter() {
  const { page, slotProps } = useScatterChart();
  return <ChartPagination {...page} slotProps={slotProps} />;
}
export function ScatterChartEmptyAdapter() {
  const { hasVisiblePoints, labels } = useScatterChart();
  return hasVisiblePoints ? null : <p>{labels.empty ?? 'Нет точек для отображения'}</p>;
}
