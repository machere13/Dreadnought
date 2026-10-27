import { useCallback, useRef } from 'react';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { useRadarChart } from './RadarChartContext.tsx';
import { RadarPlot } from './RadarPlot.tsx';
import { RadarDataTable } from './RadarDataTable.tsx';
import {
  radarNativeProps as native,
  type RadarChartPlotProps,
  type RadarChartLegendProps,
} from './radarChart.types.ts';

export function RadarChartPlotAdapter(props: RadarChartPlotProps) {
  const context = useRadarChart();
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
  const drawing =
    viewport && width === undefined
      ? { width: Math.max(400, viewport.width), height: Math.max(320, viewport.height) }
      : viewport;
  return (
    <div {...native(slotProps.plotContainer)} ref={attachPlot} data-ui="radar-plot-container">
      {drawing && <RadarPlot {...context} {...drawing} {...props} />}
    </div>
  );
}
export function RadarChartLegendAdapter({ children }: RadarChartLegendProps) {
  const { series, visible, toggle, labels, slotProps } = useRadarChart();
  return (
    <div
      {...native(slotProps.legend)}
      role="group"
      aria-label={labels.legend}
      data-ui="radar-legend"
    >
      {series.map((item) => {
        const slot = native(slotProps.legendButton?.(item), [
          'aria-label',
          'aria-labelledby',
          'disabled',
        ]);
        const content = item.label || item.id;
        return (
          <button
            {...slot}
            key={item.id}
            type="button"
            aria-pressed={visible.includes(item.id)}
            data-ui="radar-legend-button"
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
                  defaultContent: content,
                })
              : content}
          </button>
        );
      })}
    </div>
  );
}
export function RadarChartTableAdapter() {
  const context = useRadarChart();
  return <RadarDataTable {...context} tableProps={context.slotProps.table} />;
}
