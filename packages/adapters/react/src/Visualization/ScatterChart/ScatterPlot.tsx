import { Fragment, useMemo, useRef, useState } from 'react';
import { getCollectionNavigation, type ScatterLayout, type ScatterSeries } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import type { ScatterChartSlotProps, ScatterChartPlotProps } from './scatterChart.types.ts';
import { ScatterAxes } from './ScatterAxes.tsx';
import type { ScatterFormat } from './scatterChart.types.ts';

type Target = { id: string; element: SVGCircleElement };
type Props = ScatterChartPlotProps & {
  source: ScatterLayout;
  series: readonly ScatterSeries[];
  visible: readonly string[];
  slotProps: ScatterChartSlotProps;
  format: ScatterFormat;
  width: number;
  height: number;
};

export function ScatterPlot({
  source,
  series,
  visible,
  slotProps,
  format,
  width,
  height,
  children,
  tooltipContent,
}: Props) {
  const byId = useMemo(() => new Map(series.map((item) => [item.id, item])), [series]);
  const all = useMemo(() => source.series.flatMap((item) => item.points), [source]);
  const viewWidth = Math.max(200, width);
  const viewHeight = Math.max(240, height);
  const largest = all.reduce((radius, point) => Math.max(radius, point.radius), 0);
  const radiusScale = largest ? Math.min(1, Math.min(viewWidth, viewHeight) / 10 / largest) : 1;
  const inset = largest * radiusScale + 4;
  const left = 32 + inset;
  const top = 24 + inset;
  const plotWidth = viewWidth - left - inset - 8;
  const plotHeight = viewHeight - top - inset - 40;
  const points = useMemo(
    () =>
      all
        .filter((point) => point.radius > 0 && visible.includes(point.seriesId))
        .map((original) => ({
          ...original,
          id: JSON.stringify([original.seriesId, original.id]),
          original,
        })),
    [all, visible],
  );
  const [active, setActive] = useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const hovered = useRef<Target | null>(null);
  const focused = useRef<Target | null>(null);
  const elements = useRef(new Map<string, SVGCircleElement>());
  const anchor = useRef<(element: Element | null) => void>(() => {});
  function restore(target: Target | null) {
    if (target?.element.isConnected && elements.current.get(target.id) === target.element) {
      setActive(target.id);
      anchor.current(target.element);
    }
  }
  const item = points.find((point) => point.id === active);
  const navigation = points.map((point) => ({ value: point.id }));
  const group = item ? byId.get(item.seriesId)! : undefined;
  const defaultContent =
    item && group ? (
      <table {...native(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
        <caption>{item.value.label || item.original.id}</caption>
        <tbody>
          <tr>
            <td>
              <MarkAdapter
                {...native(slotProps.tooltipMark?.(group), ['aria-hidden'])}
                shape="circle"
              />
            </td>
            <th scope="row" colSpan={2}>
              {group.label || group.id}
            </th>
          </tr>
          <tr>
            <td />
            <th scope="row">{format.xLabel}</th>
            <td>{format.formatX(item.value.x)}</td>
          </tr>
          <tr>
            <td />
            <th scope="row">{format.yLabel}</th>
            <td>{format.formatY(item.value.y)}</td>
          </tr>
          {item.value.size !== undefined && (
            <tr>
              <td />
              <th scope="row">{format.sizeLabel}</th>
              <td>{format.formatSize(item.value.size)}</td>
            </tr>
          )}
        </tbody>
      </table>
    ) : null;
  const content =
    item && group && tooltipContent
      ? tooltipContent({ point: item.original, series: group, format, defaultContent })
      : defaultContent;
  const hasContent = content !== null && content !== undefined && content !== false;
  if (!hasContent && tooltipOpen) setTooltipOpen(false);
  if (active !== null && !item) setActive(null);
  return (
    <TooltipAdapter
      {...native(slotProps.tooltip, ['ref'])}
      content={content}
      open={tooltipOpen && hasContent}
      onOpenChange={setTooltipOpen}
      onPointerLeave={(event) => {
        slotProps.tooltip?.onPointerLeave?.(event);
        if (!event.defaultPrevented) restore(focused.current);
      }}
    >
      {({ ref: attach, ...trigger }) => {
        anchor.current = attach;
        return (
          <svg
            {...native(slotProps.plot, ['role', 'aria-hidden', 'tabIndex'])}
            width={width}
            height={height}
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            preserveAspectRatio="xMidYMid meet"
            data-ui="scatter-plot"
          >
            <ScatterAxes
              source={source}
              left={left}
              top={top}
              inset={inset}
              width={plotWidth}
              height={plotHeight}
              format={format}
              slotProps={slotProps}
            />
            {points.map((point) => {
              const seriesItem = byId.get(point.seriesId)!;
              const slot = native(slotProps.point?.(seriesItem, point.original), [
                'aria-hidden',
                'hidden',
              ]);
              const selected = active === point.id;
              const cx = left + point.x * plotWidth;
              const cy = top + point.y * plotHeight;
              const radius = point.radius * radiusScale;
              const accessibleLabel = [
                seriesItem.label || seriesItem.id,
                point.value.label || point.original.id,
                `${format.xLabel}: ${format.formatX(point.value.x)}`,
                `${format.yLabel}: ${format.formatY(point.value.y)}`,
                ...(point.value.size === undefined
                  ? []
                  : [`${format.sizeLabel}: ${format.formatSize(point.value.size)}`]),
              ].join(', ');
              return (
                <Fragment key={point.id}>
                  {children && (
                    <g aria-hidden="true" pointerEvents="none" data-ui="scatter-point-drawing">
                      {children({
                        point: point.original,
                        series: seriesItem,
                        cx,
                        cy,
                        radius,
                        active: selected && !!trigger['aria-describedby'],
                        defaultContent: (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            className={slot.className}
                            style={slot.style}
                          />
                        ),
                      })}
                    </g>
                  )}
                  <circle
                    {...slot}
                    key={point.id}
                    ref={(element) => {
                      if (!element) return;
                      elements.current.set(point.id, element);
                      return attachRef(element, slot.ref, () => elements.current.delete(point.id));
                    }}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    style={
                      children
                        ? {
                            ...slot.style,
                            fillOpacity: 0,
                            strokeOpacity: 'var(--scatter-hit-stroke-opacity, 0)',
                          }
                        : slot.style
                    }
                    data-custom={children ? true : undefined}
                    role="img"
                    tabIndex={0}
                    aria-label={accessibleLabel}
                    aria-describedby={selected ? trigger['aria-describedby'] : undefined}
                    data-ui="scatter-point"
                    data-series-id={point.seriesId}
                    data-point-id={point.original.id}
                    data-active={(selected && !!trigger['aria-describedby']) || undefined}
                    onPointerEnter={(event) => {
                      slot.onPointerEnter?.(event);
                      if (event.defaultPrevented) return;
                      hovered.current = { id: point.id, element: event.currentTarget };
                      setActive(point.id);
                      trigger.onPointerEnter?.(event);
                    }}
                    onPointerLeave={(event) => {
                      slot.onPointerLeave?.(event);
                      if (event.defaultPrevented) return;
                      hovered.current = null;
                      const target = event.relatedTarget;
                      const popup = trigger['aria-describedby']
                        ? event.currentTarget.ownerDocument.getElementById(
                            trigger['aria-describedby'],
                          )
                        : null;
                      if (!(target instanceof Node && popup?.contains(target))) {
                        restore(focused.current);
                      }
                      trigger.onPointerLeave?.(event);
                    }}
                    onFocus={(event) => {
                      slot.onFocus?.(event);
                      if (event.defaultPrevented) return;
                      focused.current = { id: point.id, element: event.currentTarget };
                      setActive(point.id);
                      trigger.onFocus?.(event);
                    }}
                    onBlur={(event) => {
                      slot.onBlur?.(event);
                      if (event.defaultPrevented) return;
                      focused.current = null;
                      restore(hovered.current);
                      trigger.onBlur?.(event);
                    }}
                    onKeyDown={(event) => {
                      slot.onKeyDown?.(event);
                      if (event.defaultPrevented || event.nativeEvent.isComposing) return;
                      trigger.onKeyDown?.(event);
                      if (event.defaultPrevented) return;
                      const orientation =
                        event.key === 'ArrowLeft' || event.key === 'ArrowRight'
                          ? 'horizontal'
                          : 'vertical';
                      const next = getCollectionNavigation(navigation, point.id, event.key, {
                        orientation,
                        loop: true,
                      });
                      if (next !== undefined) {
                        event.preventDefault();
                        elements.current.get(next)?.focus();
                      }
                    }}
                  />
                </Fragment>
              );
            })}
          </svg>
        );
      }}
    </TooltipAdapter>
  );
}
