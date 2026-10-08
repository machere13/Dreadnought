import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  sampleLineLayout,
  getLinePointAtX,
  getClosestLinePoint,
  getNavigationDirection,
  getNextEnabledValue,
  type LineLayout,
  type LinePoint,
} from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import type { LineChartAdapterProps } from './lineChart.types.ts';
import { attachRef } from '../../shared/attachRef.ts';

type Props = Pick<LineChartAdapterProps, 'series' | 'xDomain'> & {
  source: LineLayout;
  values: ReadonlyMap<string, ReadonlyMap<number, number | null>>;
  width: number;
  height: number;
  visible: readonly string[];
  slotProps: NonNullable<LineChartAdapterProps['slotProps']>;
  formatX: (value: number) => string;
  formatY: (value: number) => string;
  xLabel: string;
  yLabel: string;
};
export function LinePlot({
  width,
  height,
  series,
  source,
  values,
  xDomain,
  visible,
  slotProps,
  formatX,
  formatY,
  xLabel,
  yLabel,
}: Props) {
  const left = 48;
  const top = 16;
  const layout = useMemo(
    () =>
      sampleLineLayout(
        source,
        Math.max(1, width - left - 16),
        Math.max(1, height - top - 32),
        xDomain,
      ),
    [source, width, height, xDomain[0], xDomain[1]],
  );
  const indexes = useMemo(
    () => new Map(source.series.map((item) => [item.id, item.segments.flat()])),
    [source],
  );
  const seriesById = useMemo(() => new Map(series.map((item) => [item.id, item])), [series]);
  const key = (point: LinePoint) => JSON.stringify([point.seriesId, point.value.x]);
  const originals = useMemo(
    () =>
      new Map(
        source.series.flatMap((item) =>
          item.segments.flat().map((point) => [key(point), point] as const),
        ),
      ),
    [source],
  );
  const points = useMemo(
    () =>
      layout.series
        .filter((item) => visible.includes(item.id))
        .flatMap((item) => item.segments.flat())
        .filter((point) => point.value.x >= xDomain[0] && point.value.x <= xDomain[1]),
    [layout, visible, xDomain[0], xDomain[1]],
  );
  const navigation = useMemo(
    () =>
      source.series
        .filter((item) => visible.includes(item.id))
        .flatMap((item) => item.segments.flat())
        .filter((point) => point.value.x >= xDomain[0] && point.value.x <= xDomain[1])
        .map((point) => ({ value: key(point) })),
    [source, visible, xDomain[0], xDomain[1]],
  );
  const [active, setActive] = useState<string>();
  const clipId = useId();
  const pendingFocus = useRef<string | undefined>(undefined);
  const hovered = useRef<string | undefined>(undefined);
  const focused = useRef<string | undefined>(undefined);
  const elements = useRef(new Map<string, SVGCircleElement>());
  const anchor = useRef<(element: Element | null) => void>(() => {});
  useEffect(() => {
    if (pendingFocus.current) {
      elements.current.get(pendingFocus.current)?.focus();
      pendingFocus.current = undefined;
    }
    const element = active ? elements.current.get(active) : undefined;
    if (element) {
      anchor.current(element);
    }
  });
  function restore(value: string | undefined) {
    const element = value ? elements.current.get(value) : undefined;
    if (element?.isConnected) {
      setActive(value);
      anchor.current(element);
    }
  }
  const original = active ? originals.get(active) : undefined;
  const point =
    original &&
    visible.includes(original.seriesId) &&
    original.value.x >= xDomain[0] &&
    original.value.x <= xDomain[1]
      ? sampleLineLayout(
          { ...source, series: [{ id: original.seriesId, label: '', segments: [[original]] }] },
          layout.width,
          layout.height,
          xDomain,
        ).series[0].segments[0]?.[0]
      : undefined;
  const focusedOriginal = focused.current ? originals.get(focused.current) : undefined;
  const focusedPoint =
    focusedOriginal &&
    visible.includes(focusedOriginal.seriesId) &&
    focusedOriginal.value.x >= xDomain[0] &&
    focusedOriginal.value.x <= xDomain[1]
      ? sampleLineLayout(
          {
            ...source,
            series: [{ id: focusedOriginal.seriesId, label: '', segments: [[focusedOriginal]] }],
          },
          layout.width,
          layout.height,
          xDomain,
        ).series[0].segments[0]?.[0]
      : undefined;
  const extra = [point, focusedPoint].filter((item): item is LinePoint => !!item);
  const marks = [...new Map([...points, ...extra].map((item) => [key(item), item])).values()];
  const rows = point
    ? series
        .filter((item) => visible.includes(item.id))
        .flatMap((item) => {
          const value = values.get(item.id)?.get(point.value.x);
          return value == null ? [] : [{ item, value }];
        })
    : [];
  const content = point ? (
    <table
      {...nativeProps(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}
      data-ui="line-tooltip-table"
    >
      <caption>{formatX(point.value.x)}</caption>
      <tbody>
        {rows.map(({ item, value }) => (
          <tr key={item.id} data-series-id={item.id}>
            <td>
              <MarkAdapter
                {...nativeProps(slotProps.tooltipMark?.(item), ['aria-hidden'])}
                shape="circle"
              />
            </td>
            <th scope="row">{item.label || item.id}</th>
            <td>{formatY(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : null;
  const plotSlot = nativeProps(slotProps.plot, ['tabIndex', 'aria-hidden']);
  return (
    <TooltipAdapter
      {...nativeProps(slotProps.tooltip, ['ref'])}
      content={content}
      disabled={active !== undefined && !point}
      onPointerLeave={(event) => {
        slotProps.tooltip?.onPointerLeave?.(event);
        if (!event.defaultPrevented) {
          restore(focused.current);
        }
      }}
    >
      {({ ref: attach, ...trigger }) => {
        anchor.current = attach;
        return (
          <svg
            {...plotSlot}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            data-ui="line-plot"
            onPointerMove={(event) => {
              plotSlot.onPointerMove?.(event);
              if (event.defaultPrevented) {
                return;
              }
              const rect = event.currentTarget.getBoundingClientRect();
              if (!rect.width || !rect.height) {
                return;
              }
              const px = ((event.clientX - rect.left) * width) / rect.width - left;
              const py = ((event.clientY - rect.top) * height) / rect.height - top;
              if (px < 0 || px > layout.width || py < 0 || py > layout.height) {
                return;
              }
              const t = px / layout.width;
              const x = xDomain[0] * (1 - t) + xDomain[1] * t;
              const candidates = visible.flatMap((id) => {
                const candidate = getLinePointAtX(indexes.get(id) ?? [], x);
                return candidate &&
                  candidate.value.x >= xDomain[0] &&
                  candidate.value.x <= xDomain[1]
                  ? [{ id, label: '', segments: [[candidate]] }]
                  : [];
              });
              const closest = getClosestLinePoint(
                sampleLineLayout(
                  { ...source, series: candidates },
                  layout.width,
                  layout.height,
                  xDomain,
                ),
                px,
                py,
              );
              if (closest && hovered.current !== key(closest)) {
                hovered.current = key(closest);
                setActive(hovered.current);
                trigger.onPointerEnter?.(event);
                restore(hovered.current);
              }
            }}
            onPointerLeave={(event) => {
              plotSlot.onPointerLeave?.(event);
              if (event.defaultPrevented) {
                return;
              }
              hovered.current = undefined;
              const target = event.relatedTarget;
              const popup = trigger['aria-describedby']
                ? event.currentTarget.ownerDocument.getElementById(trigger['aria-describedby'])
                : null;
              if (!(target instanceof Node && popup?.contains(target))) {
                restore(focused.current);
              }
              trigger.onPointerLeave?.(event);
            }}
          >
            <g transform={`translate(${left} ${top})`}>
              <defs>
                <clipPath id={clipId}>
                  <rect width={layout.width} height={layout.height} />
                </clipPath>
              </defs>
              <g {...nativeProps(slotProps.grid)} data-ui="line-grid">
                {layout.yTicks.map((tick) => (
                  <line
                    key={tick.value}
                    x1={0}
                    x2={layout.width}
                    y1={tick.position}
                    y2={tick.position}
                  />
                ))}
                {layout.xTicks.map((tick) => (
                  <line
                    key={tick.value}
                    x1={tick.position}
                    x2={tick.position}
                    y1={0}
                    y2={layout.height}
                  />
                ))}
              </g>
              {layout.xTicks.map((tick) => (
                <text
                  {...nativeProps(slotProps.axisLabel?.('x', tick.value))}
                  key={`x${tick.value}`}
                  x={tick.position}
                  y={layout.height + 16}
                  textAnchor={
                    tick.position === 0
                      ? 'start'
                      : tick.position === layout.width
                        ? 'end'
                        : 'middle'
                  }
                  data-ui="line-axis-label"
                >
                  {formatX(tick.value)}
                </text>
              ))}
              {layout.yTicks.map((tick) => (
                <text
                  {...nativeProps(slotProps.axisLabel?.('y', tick.value))}
                  key={`y${tick.value}`}
                  x={-8}
                  y={tick.position}
                  textAnchor="end"
                  data-ui="line-axis-label"
                >
                  {formatY(tick.value)}
                </text>
              ))}
              <text x={0} y={-4} data-ui="line-axis-label">
                {yLabel}
              </text>
              <text
                x={layout.width}
                y={layout.height + 30}
                textAnchor="end"
                data-ui="line-axis-label"
              >
                {xLabel}
              </text>
              <g clipPath={`url(#${clipId})`}>
                {layout.series
                  .filter((item) => visible.includes(item.id))
                  .flatMap((item) =>
                    item.segments.map((segment, index) => (
                      <polyline
                        {...nativeProps(slotProps.series?.(seriesById.get(item.id)!))}
                        key={`${item.id}/${index}`}
                        points={segment.map((point) => `${point.x},${point.y}`).join(' ')}
                        data-ui="line-series"
                        data-series-id={item.id}
                      />
                    )),
                  )}
              </g>
              {marks.map((point) => {
                const identity = key(point);
                const item = seriesById.get(point.seriesId)!;
                const slot = nativeProps(slotProps.point?.(item, point));
                return (
                  <circle
                    {...slot}
                    key={identity}
                    ref={(element) => {
                      if (element) {
                        elements.current.set(identity, element);
                        return attachRef(element, slot.ref, () => {
                          elements.current.delete(identity);
                        });
                      }
                    }}
                    cx={point.x}
                    cy={point.y}
                    r={2}
                    role="img"
                    tabIndex={0}
                    aria-label={`${item.label || item.id}, ${formatX(point.value.x)}: ${formatY(point.value.y)}`}
                    aria-describedby={identity === active ? trigger['aria-describedby'] : undefined}
                    data-active={
                      (identity === active && !!trigger['aria-describedby']) || undefined
                    }
                    data-ui="line-point"
                    data-series-id={item.id}
                    data-x={point.value.x}
                    onPointerEnter={(event) => {
                      slot.onPointerEnter?.(event);
                      if (!event.defaultPrevented) {
                        hovered.current = identity;
                        setActive(identity);
                        trigger.onPointerEnter?.(event);
                      }
                    }}
                    onFocus={(event) => {
                      slot.onFocus?.(event);
                      if (!event.defaultPrevented) {
                        focused.current = identity;
                        setActive(identity);
                        trigger.onFocus?.(event);
                      }
                    }}
                    onBlur={(event) => {
                      slot.onBlur?.(event);
                      if (!event.defaultPrevented) {
                        focused.current = undefined;
                        restore(hovered.current);
                        trigger.onBlur?.(event);
                      }
                    }}
                    onKeyDown={(event) => {
                      slot.onKeyDown?.(event);
                      if (event.defaultPrevented || event.nativeEvent.isComposing) {
                        return;
                      }
                      trigger.onKeyDown?.(event);
                      const direction = getNavigationDirection(event.key, {
                        orientation: 'horizontal',
                      });
                      if (!direction) {
                        return;
                      }
                      const next = getNextEnabledValue(navigation, identity, direction, {
                        loop: false,
                      });
                      if (next) {
                        event.preventDefault();
                        pendingFocus.current = next;
                        setActive(next);
                      }
                    }}
                  />
                );
              })}
            </g>
          </svg>
        );
      }}
    </TooltipAdapter>
  );
}
