import { useCallback, useRef } from 'react';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';

import { PiePlot } from './PiePlot.tsx';
import { usePieChart } from './PieChartContext.tsx';
import type { PieChartPlotProps, PieChartLegendProps } from './pieChart.types.ts';

export function PieChartPlotAdapter(props: PieChartPlotProps) {
  const context = usePieChart();
  const { width, height, slotProps, layout } = context;
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
  const viewport = measured;
  return (
    <div {...native(slotProps.plotContainer)} ref={attachPlot} data-ui="pie-plot-container">
      {!!layout.slices.length && viewport && <PiePlot {...context} {...viewport} {...props} />}
    </div>
  );
}
export function PieChartEmptyAdapter() {
  const { layout, labels } = usePieChart();
  return layout.slices.length ? null : <p role="status">{labels.empty}</p>;
}
export function PieChartLegendAdapter({ children }: PieChartLegendProps) {
  const { data, visible, toggle, labels, slotProps } = usePieChart();
  return (
    <div {...native(slotProps.legend)} role="group" aria-label={labels.legend} data-ui="pie-legend">
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
            aria-pressed={visible.includes(item.id)}
            data-ui="pie-legend-button"
            data-item-id={item.id}
            onClick={(event) => {
              slot.onClick?.(event);
              if (!event.defaultPrevented) toggle(item.id);
            }}
          >
            {children
              ? children({
                  item,
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
export function PieChartTableAdapter() {
  const { data, label, labels, slotProps } = usePieChart();
  return (
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
  );
}
