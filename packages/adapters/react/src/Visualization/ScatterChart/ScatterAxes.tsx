import type { ScatterLayout } from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { ScatterChartSlotProps, ScatterFormat } from './scatterChart.types.ts';

export function ScatterAxes({
  source,
  left,
  top,
  inset,
  width,
  height,
  format,
  slotProps,
}: {
  source: ScatterLayout;
  left: number;
  top: number;
  inset: number;
  width: number;
  height: number;
  format: ScatterFormat;
  slotProps: ScatterChartSlotProps;
}) {
  return (
    <g transform={`translate(${left} ${top})`}>
      <g {...native(slotProps.grid)} aria-hidden="true" data-ui="scatter-grid">
        {source.xTicks.map((tick) => (
          <line
            key={`x${tick.value}`}
            x1={tick.position * width}
            x2={tick.position * width}
            y1={0}
            y2={height}
          />
        ))}
        {source.yTicks.map((tick) => (
          <line
            key={`y${tick.value}`}
            x1={0}
            x2={width}
            y1={tick.position * height}
            y2={tick.position * height}
          />
        ))}
      </g>
      {source.xTicks.map((tick) => (
        <text
          {...native(slotProps.axisLabel?.('x', tick.value))}
          key={`x${tick.value}`}
          x={tick.position * width}
          y={height + inset + 16}
          textAnchor={tick.position === 0 ? 'start' : tick.position === 1 ? 'end' : 'middle'}
          data-ui="scatter-axis-label"
        >
          {format.formatX(tick.value)}
        </text>
      ))}
      {source.yTicks.map((tick) => (
        <text
          {...native(slotProps.axisLabel?.('y', tick.value))}
          key={`y${tick.value}`}
          x={-inset - 8}
          y={tick.position * height}
          textAnchor="end"
          data-ui="scatter-axis-label"
        >
          {format.formatY(tick.value)}
        </text>
      ))}
      <text x={-inset} y={-inset - 8} data-ui="scatter-axis-label">
        {format.yLabel}
      </text>
      <text x={width + inset} y={height + inset + 36} textAnchor="end" data-ui="scatter-axis-label">
        {format.xLabel}
      </text>
    </g>
  );
}
