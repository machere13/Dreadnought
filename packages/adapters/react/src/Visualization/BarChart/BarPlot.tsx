import { useRef, useState } from 'react';
import { buildBarLayout, getNavigationDirection, getNextEnabledValue } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/index.ts';
import { MarkAdapter } from '../../DataDisplay/Mark/index.ts';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import type { BarChartAdapterProps } from './barChart.types.ts';

type Props = Pick<BarChartAdapterProps, 'categories' | 'series' | 'domain' | 'orientation' | 'gapRatio'> & {
  width: number; height: number; visible: readonly string[]; slotProps: NonNullable<BarChartAdapterProps['slotProps']>;
  formatValue: (value: number) => string; categoryLabel: string; valueLabel: string;
};
export function BarPlot({ width, height, categories, series, domain, orientation, gapRatio, visible, slotProps, formatValue, categoryLabel, valueLabel }: Props) {
  const vertical = orientation !== 'horizontal';
  const left = vertical ? 48 : 96, top = 20;
  const layout = buildBarLayout({ categories, series: series.filter(item => visible.includes(item.id)), domain, orientation, gapRatio,
    width: Math.max(1, width - left - 16), height: Math.max(1, height - top - 40) });
  const key = (bar: typeof layout.bars[number]) => JSON.stringify([bar.seriesId, bar.categoryId]);
  const [active, setActive] = useState<string>();
  const hovered = useRef<string | undefined>(undefined), focused = useRef<string | undefined>(undefined);
  const elements = useRef(new Map<string, SVGGElement>());
  const anchor = useRef<(element: Element | null) => void>(() => {});
  function restore(value: string | undefined) {
    const element = value ? elements.current.get(value) : undefined;
    if (element?.isConnected) { setActive(value); anchor.current(element); }
  }
  const bar = layout.bars.find(item => key(item) === active);
  const category = bar ? categories.find(item => item.id === bar.categoryId) : undefined;
  const rows = bar ? series.filter(item => visible.includes(item.id)).flatMap(item => {
    const value = Object.hasOwn(item.values, bar.categoryId) ? item.values[bar.categoryId] : null;
    return value == null ? [] : [{ item, value }];
  }) : [];
  const content = category ? <table {...nativeProps(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])} data-ui="bar-tooltip-table">
    <caption>{category.label || category.id}</caption><tbody>{rows.map(({ item, value }) => <tr key={item.id} data-series-id={item.id}>
      <td><MarkAdapter {...nativeProps(slotProps.tooltipMark?.(item), ['aria-hidden'])} shape="circle" /></td>
      <th scope="row">{item.label || item.id}</th><td>{formatValue(value)}</td>
    </tr>)}</tbody>
  </table> : null;
  const plotSlot = nativeProps(slotProps.plot, ['tabIndex', 'aria-hidden']);
  return <TooltipAdapter {...nativeProps(slotProps.tooltip, ['ref'])} content={content} disabled={active !== undefined && !bar}
    onPointerLeave={event => { slotProps.tooltip?.onPointerLeave?.(event); if (!event.defaultPrevented) restore(focused.current); }}>
    {({ ref: attach, ...trigger }) => {
      anchor.current = attach;
      return <svg {...plotSlot} width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" data-ui="bar-plot" data-orientation={layout.orientation}
        onPointerLeave={event => {
          plotSlot.onPointerLeave?.(event); if (event.defaultPrevented) return;
          hovered.current = undefined;
          const target = event.relatedTarget;
          const popup = trigger['aria-describedby'] ? event.currentTarget.ownerDocument.getElementById(trigger['aria-describedby']) : null;
          if (!(target instanceof Node && popup?.contains(target))) restore(focused.current);
          trigger.onPointerLeave?.(event);
        }}>
        <g transform={`translate(${left} ${top})`}>
          <g {...nativeProps(slotProps.grid)} data-ui="bar-grid">
            {layout.ticks.map(tick => <line key={tick.value} x1={vertical ? 0 : tick.position} x2={vertical ? layout.width : tick.position}
              y1={vertical ? tick.position : 0} y2={vertical ? tick.position : layout.height} />)}
            <line data-ui="bar-baseline" x1={vertical ? 0 : layout.baseline} x2={vertical ? layout.width : layout.baseline}
              y1={vertical ? layout.baseline : 0} y2={vertical ? layout.baseline : layout.height} />
          </g>
          {layout.ticks.map(tick => <text {...nativeProps(slotProps.valueLabel?.(tick.value))} key={`value${tick.value}`}
            x={vertical ? -8 : tick.position} y={vertical ? tick.position : layout.height + 16}
            textAnchor={vertical ? 'end' : tick.position === 0 ? 'start' : tick.position === layout.width ? 'end' : 'middle'} data-ui="bar-axis-label">{formatValue(tick.value)}</text>)}
          {layout.categories.map(item => <text {...nativeProps(slotProps.categoryLabel?.(item))} key={item.id}
            x={vertical ? item.position : -8} y={vertical ? layout.height + 16 : item.position} textAnchor={vertical ? 'middle' : 'end'} data-ui="bar-axis-label">{item.label || item.id}</text>)}
          <text x={0} y={-6} data-ui="bar-axis-label">{vertical ? valueLabel : categoryLabel}</text>
          <text x={layout.width} y={layout.height + 34} textAnchor="end" data-ui="bar-axis-label">{vertical ? categoryLabel : valueLabel}</text>
          {layout.bars.map(bar => {
            const identity = key(bar), item = series.find(item => item.id === bar.seriesId)!;
            const category = categories.find(item => item.id === bar.categoryId)!;
            const slot = nativeProps(slotProps.bar?.(item, bar), ['aria-labelledby']);
            return <g {...slot} key={identity} ref={element => {
              if (element) { elements.current.set(identity, element); return attachRef(element, slot.ref, () => { elements.current.delete(identity); }); }
            }} role="img" tabIndex={0} aria-label={`${item.label || item.id}, ${category.label || category.id}: ${formatValue(bar.value)}`}
              aria-describedby={identity === active ? trigger['aria-describedby'] : undefined} data-active={identity === active && !!trigger['aria-describedby'] || undefined}
              data-ui="bar-item" data-series-id={item.id} data-category-id={category.id}
              onPointerEnter={event => { slot.onPointerEnter?.(event); if (!event.defaultPrevented) { hovered.current = identity; setActive(identity); trigger.onPointerEnter?.(event); } }}
              onPointerLeave={event => {
                slot.onPointerLeave?.(event); if (event.defaultPrevented) return;
                hovered.current = undefined;
                const target = event.relatedTarget;
                const popup = trigger['aria-describedby'] ? event.currentTarget.ownerDocument.getElementById(trigger['aria-describedby']) : null;
                if (!(target instanceof Node && popup?.contains(target))) restore(focused.current);
                trigger.onPointerLeave?.(event);
              }}
              onFocus={event => { slot.onFocus?.(event); if (!event.defaultPrevented) { focused.current = identity; setActive(identity); trigger.onFocus?.(event); } }}
              onBlur={event => { slot.onBlur?.(event); if (!event.defaultPrevented) { focused.current = undefined; restore(hovered.current); trigger.onBlur?.(event); } }}
              onKeyDown={event => {
                slot.onKeyDown?.(event); if (event.defaultPrevented || event.nativeEvent.isComposing) return;
                trigger.onKeyDown?.(event);
                const direction = getNavigationDirection(event.key, { orientation: vertical ? 'horizontal' : 'vertical' });
                if (!direction) return;
                const next = getNextEnabledValue(layout.bars.map(bar => ({ value: key(bar) })), identity, direction, { loop: false });
                if (next) { event.preventDefault(); elements.current.get(next)?.focus(); }
              }}>
              <rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} data-ui="bar-rect" />
              {bar.value === 0 && <line x1={bar.x} x2={bar.x + bar.width} y1={bar.y} y2={bar.y + bar.height} data-ui="bar-zero" />}
            </g>;
          })}
        </g>
      </svg>;
    }}
  </TooltipAdapter>;
}
