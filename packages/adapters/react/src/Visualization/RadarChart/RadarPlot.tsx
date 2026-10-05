import type { RadarLayout, RadarMetric, RadarSeries } from '@dreadnought/core';
import { useRef, useState } from 'react';
import { MarkAdapter } from '../../DataDisplay/Mark/index.ts';
import { TooltipAdapter } from '../../Overlays/Tooltip/index.ts';
import { radarNativeProps, type RadarChartSlotProps } from './radarChart.types.ts';

type Props = {
  layout: RadarLayout; metrics: readonly RadarMetric[]; series: readonly RadarSeries[];
  visible: readonly string[]; slotProps: RadarChartSlotProps; width: number; height: number;
};
type Vertex = { series: string; metric: string; element: SVGCircleElement };
export function RadarPlot({ layout, metrics, series, visible, slotProps, width, height }: Props) {
  const [active, setActive] = useState<{ series: string; metric: string } | null>(null);
  const hovered = useRef<Vertex | null>(null), focused = useRef<Vertex | null>(null);
  const activeSeries = series.find(item => item.id === active?.series && visible.includes(item.id));
  const activeMetric = metrics.find(item => item.id === active?.metric);
  const content = activeSeries && activeMetric ? <table {...radarNativeProps(slotProps.tooltipTable, ['role', 'aria-hidden', 'hidden'])} data-ui="radar-tooltip-table">
    <caption>{activeMetric.label || activeMetric.id}</caption>
    <tbody>{series.filter(item => visible.includes(item.id)).map(item => <tr key={item.id} data-series-id={item.id}>
      <td><MarkAdapter {...radarNativeProps(slotProps.tooltipMark?.(item), ['aria-hidden'])} shape="circle" /></td>
      <th scope="row">{item.label || item.id}</th>
      <td>{item.values[activeMetric.id]}</td>
    </tr>)}</tbody>
  </table> : null;
  return <TooltipAdapter {...radarNativeProps(slotProps.tooltip, ['ref'])} content={content} disabled={active !== null && !content}>
    {({ ref: attach, ...trigger }) => <svg {...radarNativeProps(slotProps.plot, ['tabIndex', 'aria-hidden'])} width={width} height={height}
    viewBox="-140 -140 280 280" preserveAspectRatio="xMidYMid meet" data-ui="radar-plot">
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
    {layout.seriesPoints.map((item, seriesIndex) => visible.includes(item.id) && item.points.map((point, metricIndex) => {
      const currentSeries = series[seriesIndex], metric = metrics[metricIndex];
      const slot = radarNativeProps(slotProps.point?.(currentSeries, metric));
      const selected = active?.series === item.id && active.metric === metric.id;
      const select = (element: SVGCircleElement) => ({ series: item.id, metric: metric.id, element });
      const restore = (vertex: Vertex | null) => { if (vertex && vertex.element.isConnected) { setActive(vertex); attach(vertex.element); } };
      return <circle {...slot} key={`${item.id}/${metric.id}`} cx={point.x} cy={point.y} r={2} tabIndex={0} role="img"
        aria-label={`${currentSeries.label || item.id}, ${metric.label || metric.id}: ${currentSeries.values[metric.id]}`}
        aria-describedby={selected ? trigger['aria-describedby'] : undefined}
        data-ui="radar-point" data-series-id={item.id} data-metric-id={metric.id} data-active={selected && !!trigger['aria-describedby'] || undefined}
        onPointerEnter={event => { slot.onPointerEnter?.(event); if (!event.defaultPrevented) { hovered.current = select(event.currentTarget); setActive(hovered.current); trigger.onPointerEnter?.(event); } }}
        onPointerLeave={event => { slot.onPointerLeave?.(event); if (!event.defaultPrevented) { hovered.current = null; restore(focused.current); trigger.onPointerLeave?.(event); } }}
        onFocus={event => { slot.onFocus?.(event); if (!event.defaultPrevented) { focused.current = select(event.currentTarget); setActive(focused.current); trigger.onFocus?.(event); } }}
        onBlur={event => { slot.onBlur?.(event); if (!event.defaultPrevented) { focused.current = null; restore(hovered.current); trigger.onBlur?.(event); } }}
        onKeyDown={event => { slot.onKeyDown?.(event); if (!event.defaultPrevented) trigger.onKeyDown?.(event); }} />;
    }))}
  </svg>}
  </TooltipAdapter>;
}
