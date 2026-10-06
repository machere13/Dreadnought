import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { buildBarLayout, getNavigationDirection, getNextEnabledValue } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/index.ts';
import { MarkAdapter } from '../../DataDisplay/Mark/index.ts';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import type { BarChartAdapterProps } from './barChart.types.ts';

type Props = Pick<BarChartAdapterProps, 'categories' | 'series' | 'domain' | 'orientation' | 'gapRatio'> & {
  width: number; height: number; visible: readonly string[]; slotProps: NonNullable<BarChartAdapterProps['slotProps']>;
  minCategorySize: number;
  formatValue: (value: number) => string; categoryLabel: string; valueLabel: string;
};
export function BarPlot({ width, height, categories, series, domain, orientation, gapRatio, visible, slotProps, formatValue, categoryLabel, valueLabel, minCategorySize }: Props) {
  const vertical = orientation !== 'horizontal';
  const left = vertical ? 48 : 96, top = 20;
  const plotWidth = Math.max(1, width - left - 16), plotHeight = Math.max(1, height - top - 40);
  const extent = vertical ? plotWidth : plotHeight;
  const band = Math.max(extent / Math.max(1, categories.length), minCategorySize * Math.max(1, visible.length));
  const seriesBounds = useMemo(() => {
    const template = buildBarLayout({ categories: [{ id: 'band', label: 'band' }],
      series: series.filter(item => visible.includes(item.id)).map(item => ({ id: item.id, label: item.label, values: { band: domain[0] } })), domain, orientation, gapRatio,
      width: vertical ? band : plotWidth, height: vertical ? plotHeight : band });
    return new Map(template.bars.map(bar => [bar.seriesId, {
      position: vertical ? bar.x : bar.y, size: vertical ? bar.width : bar.height,
    }]));
  }, [series, visible, domain[0], domain[1], orientation, gapRatio, vertical, band, plotWidth, plotHeight]);
  const maximum = Math.max(0, categories.length * band - extent);
  const [scroll, setScroll] = useState(0);
  const offset = Math.min(scroll, maximum);
  const scrollRef = useRef<HTMLDivElement>(null), pendingFocus = useRef<string | undefined>(undefined);
  const clipId = useId();
  const start = Math.max(0, Math.floor(offset / band) - 1), end = Math.min(categories.length, Math.ceil((offset + extent) / band) + 1);
  const categoryIndexes = useMemo(() => new Map(categories.map((item, index) => [item.id, index])), [categories]);
  const categoriesById = useMemo(() => new Map(categories.map(item => [item.id, item])), [categories]);
  const seriesById = useMemo(() => new Map(series.map(item => [item.id, item])), [series]);
  const navigation = useMemo(() => categories.flatMap(category => series.filter(item => visible.includes(item.id) && Object.hasOwn(item.values, category.id) && item.values[category.id] !== null)
    .map(item => ({ value: JSON.stringify([item.id, category.id]) }))), [categories, series, visible]);
  const layout = useMemo(() => {
    const window = categories.slice(start, end);
    const selected = series.filter(item => visible.includes(item.id)).map(item => ({ ...item,
      values: Object.fromEntries(window.filter(category => Object.hasOwn(item.values, category.id)).map(category => [category.id, item.values[category.id]])) }));
    const result = buildBarLayout({ categories: window, series: selected, domain, orientation, gapRatio,
      width: vertical ? Math.max(1, window.length * band) : plotWidth, height: vertical ? plotHeight : Math.max(1, window.length * band) });
    const shift = start * band - offset;
    return { ...result, width: plotWidth, height: plotHeight,
      categories: result.categories.map(item => ({ ...item, position: item.position + shift })),
      bars: result.bars.map(bar => ({ ...bar, x: bar.x + (vertical ? shift : 0), y: bar.y + (vertical ? 0 : shift) })) };
  }, [categories, series, domain[0], domain[1], orientation, gapRatio, visible, start, end, band, offset, plotWidth, plotHeight, vertical]);
  const key = (bar: typeof layout.bars[number]) => JSON.stringify([bar.seriesId, bar.categoryId]);
  const [active, setActive] = useState<string>();
  const hovered = useRef<string | undefined>(undefined), focused = useRef<string | undefined>(undefined);
  const elements = useRef(new Map<string, SVGGElement>());
  const anchor = useRef<(element: Element | null) => void>(() => {});
  function reveal(categoryId: string, seriesId: string) {
    const bounds = seriesBounds.get(seriesId)!;
    const position = categoryIndexes.get(categoryId)! * band + bounds.position;
    const next = Math.max(0, Math.min(maximum, position < offset ? position : position + bounds.size > offset + extent ? position + bounds.size - extent : offset));
    if (scrollRef.current) { scrollRef.current.scrollLeft = vertical ? next : 0; scrollRef.current.scrollTop = vertical ? 0 : next; }
    setScroll(next);
  }
  useEffect(() => {
    if (pendingFocus.current) { elements.current.get(pendingFocus.current)?.focus(); pendingFocus.current = undefined; }
  });
  useEffect(() => {
    setScroll(0);
    if (scrollRef.current) { scrollRef.current.scrollLeft = 0; scrollRef.current.scrollTop = 0; }
  }, [categories, orientation]);
  useEffect(() => {
    if (scroll > maximum) {
      setScroll(maximum);
      if (scrollRef.current) { scrollRef.current.scrollLeft = vertical ? maximum : 0; scrollRef.current.scrollTop = vertical ? 0 : maximum; }
    }
  }, [scroll, maximum, vertical]);
  function restore(value: string | undefined) {
    const element = value ? elements.current.get(value) : undefined;
    if (element?.isConnected) { setActive(value); anchor.current(element); }
  }
  const bar = layout.bars.find(item => key(item) === active);
  const category = bar ? categoriesById.get(bar.categoryId) : undefined;
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
  const scrollSlot = nativeProps(slotProps.scrollContainer);
  return <div {...scrollSlot} ref={element => {
    scrollRef.current = element;
    if (element) return attachRef(element, scrollSlot.ref, () => { scrollRef.current = null; });
  }} style={{ ...scrollSlot.style, overflowX: vertical ? 'auto' : 'hidden', overflowY: vertical ? 'hidden' : 'auto', maxWidth: width, height: vertical ? undefined : height }} data-ui="bar-scroll-container"
    onScroll={event => { scrollSlot.onScroll?.(event); if (!event.defaultPrevented) setScroll(Math.max(0, vertical ? event.currentTarget.scrollLeft : event.currentTarget.scrollTop)); }}>
    <div style={{ width: vertical ? categories.length * band + left + 16 : undefined, height: vertical ? height : categories.length * band + top + 40 }}>
    <TooltipAdapter {...nativeProps(slotProps.tooltip, ['ref'])} content={content} disabled={active !== undefined && !bar}
    onPointerLeave={event => { slotProps.tooltip?.onPointerLeave?.(event); if (!event.defaultPrevented) restore(focused.current); }}>
    {({ ref: attach, ...trigger }) => {
      anchor.current = attach;
      return <svg {...plotSlot} style={{ ...plotSlot.style, position: 'sticky', top: 0, left: 0 }} width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" data-ui="bar-plot" data-orientation={layout.orientation}
        onPointerLeave={event => {
          plotSlot.onPointerLeave?.(event); if (event.defaultPrevented) return;
          hovered.current = undefined;
          const target = event.relatedTarget;
          const popup = trigger['aria-describedby'] ? event.currentTarget.ownerDocument.getElementById(trigger['aria-describedby']) : null;
          if (!(target instanceof Node && popup?.contains(target))) restore(focused.current);
          trigger.onPointerLeave?.(event);
        }}>
        <g transform={`translate(${left} ${top})`}>
          <defs><clipPath id={`${clipId}-bars`}><rect width={plotWidth} height={plotHeight} /></clipPath>
            <clipPath id={`${clipId}-labels`}><rect x={vertical ? 0 : -left} y={vertical ? plotHeight : 0} width={vertical ? plotWidth : left} height={vertical ? height - top - plotHeight : plotHeight} /></clipPath></defs>
          <g {...nativeProps(slotProps.grid)} data-ui="bar-grid">
            {layout.ticks.map(tick => <line key={tick.value} x1={vertical ? 0 : tick.position} x2={vertical ? layout.width : tick.position}
              y1={vertical ? tick.position : 0} y2={vertical ? tick.position : layout.height} />)}
            <line data-ui="bar-baseline" x1={vertical ? 0 : layout.baseline} x2={vertical ? layout.width : layout.baseline}
              y1={vertical ? layout.baseline : 0} y2={vertical ? layout.baseline : layout.height} />
          </g>
          {layout.ticks.map(tick => <text {...nativeProps(slotProps.valueLabel?.(tick.value))} key={`value${tick.value}`}
            x={vertical ? -8 : tick.position} y={vertical ? tick.position : layout.height + 16}
            textAnchor={vertical ? 'end' : tick.position === 0 ? 'start' : tick.position === layout.width ? 'end' : 'middle'} data-ui="bar-axis-label">{formatValue(tick.value)}</text>)}
          <g clipPath={`url(#${clipId}-labels)`}>{layout.categories.map(item => <text {...nativeProps(slotProps.categoryLabel?.(item))} key={item.id}
            x={vertical ? item.position : -8} y={vertical ? layout.height + 16 : item.position} textAnchor={vertical ? 'middle' : 'end'} data-ui="bar-axis-label">{item.label || item.id}</text>)}</g>
          <text x={0} y={-6} data-ui="bar-axis-label">{vertical ? valueLabel : categoryLabel}</text>
          <text x={layout.width} y={layout.height + 34} textAnchor="end" data-ui="bar-axis-label">{vertical ? categoryLabel : valueLabel}</text>
          <g clipPath={`url(#${clipId}-bars)`}>{layout.bars.map(bar => {
            const identity = key(bar), item = seriesById.get(bar.seriesId)!;
            const category = categoriesById.get(bar.categoryId)!;
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
              onFocus={event => { slot.onFocus?.(event); if (!event.defaultPrevented) { reveal(bar.categoryId, bar.seriesId); focused.current = identity; setActive(identity); trigger.onFocus?.(event); } }}
              onBlur={event => { slot.onBlur?.(event); if (!event.defaultPrevented) { focused.current = undefined; restore(hovered.current); trigger.onBlur?.(event); } }}
              onKeyDown={event => {
                slot.onKeyDown?.(event); if (event.defaultPrevented || event.nativeEvent.isComposing) return;
                trigger.onKeyDown?.(event);
                const direction = getNavigationDirection(event.key, { orientation: vertical ? 'horizontal' : 'vertical' });
                if (!direction) return;
                const next = getNextEnabledValue(navigation, identity, direction, { loop: false });
                if (next) {
                  event.preventDefault();
                  const [seriesId, categoryId] = JSON.parse(next) as [string, string];
                  pendingFocus.current = next;
                  reveal(categoryId, seriesId); setActive(next);
                }
              }}>
              <rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} data-ui="bar-rect" />
              {bar.value === 0 && <line x1={bar.x} x2={bar.x + bar.width} y1={bar.y} y2={bar.y + bar.height} data-ui="bar-zero" />}
            </g>;
          })}</g>
        </g>
      </svg>;
    }}
  </TooltipAdapter></div></div>;
}
