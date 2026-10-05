import type { RadarLayout, RadarMetric, RadarSeries } from '@dreadnought/core';
import { radarNativeProps, type RadarChartSlotProps } from './radarChart.types.ts';

type Props = {
  layout: RadarLayout; metrics: readonly RadarMetric[]; series: readonly RadarSeries[];
  visible: readonly string[]; slotProps: RadarChartSlotProps; width: number; height: number;
};
export function RadarPlot({ layout, metrics, series, visible, slotProps, width, height }: Props) {
  return <svg {...radarNativeProps(slotProps.plot, ['tabIndex'])} width={width} height={height}
    viewBox="-140 -140 280 280" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" data-ui="radar-plot">
    <g {...radarNativeProps(slotProps.grid)} data-ui="radar-grid">
      {[0.25, 0.5, 0.75, 1].map(ratio => <polygon key={ratio} points={layout.axes.map(axis => `${axis.x * ratio},${axis.y * ratio}`).join(' ')} />)}
    </g>
    {layout.axes.map((axis, index) => <g key={axis.id}>
      <line {...radarNativeProps(slotProps.axis?.(metrics[index]))} x1={0} y1={0} x2={axis.x} y2={axis.y} data-ui="radar-axis" />
      <text {...radarNativeProps(slotProps.axisLabel?.(metrics[index]))} x={axis.x * 1.12} y={axis.y * 1.12}
        textAnchor={Math.abs(axis.x) < 1e-8 ? 'middle' : axis.x > 0 ? 'start' : 'end'} data-ui="radar-axis-label">{axis.label || axis.id}</text>
    </g>)}
    {layout.seriesPoints.map((item, index) => visible.includes(item.id) && <polygon key={item.id}
      {...radarNativeProps(slotProps.series?.(series[index]))} points={item.points.map(point => `${point.x},${point.y}`).join(' ')}
      data-ui="radar-series" data-series-id={item.id} />)}
  </svg>;
}
