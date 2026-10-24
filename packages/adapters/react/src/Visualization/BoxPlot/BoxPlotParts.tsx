import { ChartPagination } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { useBoxPlot } from './BoxPlotContext.tsx';
import { BoxPlotDataTable } from './BoxPlotStatistics.tsx';

export function BoxPlotAxisAdapter() {
  const { layout, valueLabel, formatValue, slotProps } = useBoxPlot();
  return (
    layout.domain && (
      <div {...native(slotProps.axis)} data-ui="box-plot-axis">
        <span>{valueLabel}</span>
        <svg width="100%" height="28" aria-hidden="true">
          {layout.ticks.map((tick, index) => (
            <text
              key={index}
              x={`${2 + tick.position * 96}%`}
              y={20}
              textAnchor={index === 0 ? 'start' : index === 4 ? 'end' : 'middle'}
              fill="currentColor"
            >
              {formatValue(tick.value)}
            </text>
          ))}
        </svg>
      </div>
    )
  );
}

export function BoxPlotTableAdapter() {
  const { page, label, labels, formatValue, slotProps } = useBoxPlot();
  return (
    <BoxPlotDataTable
      groups={page.rows}
      label={label}
      labels={labels}
      formatValue={formatValue}
      slotProps={slotProps}
    />
  );
}

export function BoxPlotPaginationAdapter() {
  const { page, slotProps } = useBoxPlot();
  return <ChartPagination {...page} slotProps={slotProps} />;
}

export function BoxPlotEmptyAdapter() {
  const { layout, labels } = useBoxPlot();
  return layout.groups.length ? null : <p>{labels.empty}</p>;
}
