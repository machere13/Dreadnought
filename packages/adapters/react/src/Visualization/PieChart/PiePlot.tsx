import { Fragment, useRef, useState } from 'react';
import { getCollectionNavigation, type PieLayout } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import type { PieChartSlotProps, PieChartPlotProps } from './pieChart.types.ts';
import { getPiePath } from './getPiePath.ts';

type Target = { id: string; element: SVGPathElement };
type Props = PieChartPlotProps & {
  layout: PieLayout;
  slotProps: PieChartSlotProps;
  width: number;
  height: number;
};
const percent = (share: number) => `${Number((share * 100).toFixed(2))}%`;

export function PiePlot({ layout, slotProps, width, height, children, tooltipContent }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const hovered = useRef<Target | null>(null);
  const focused = useRef<Target | null>(null);
  const elements = useRef(new Map<string, SVGPathElement>());
  const item = layout.slices.find((slice) => slice.id === active);
  const navigation = layout.slices.map((slice) => ({ value: slice.id }));
  const defaultContent = item ? (
    <table {...native(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
      <tbody>
        <tr>
          <td>
            <MarkAdapter
              {...native(slotProps.tooltipMark?.(item), ['aria-hidden'])}
              shape="circle"
            />
          </td>
          <th scope="row">{item.label || item.id}</th>
          <td>{item.value}</td>
          <td>{percent(item.share)}</td>
        </tr>
      </tbody>
    </table>
  ) : null;
  const content =
    item && tooltipContent
      ? tooltipContent({ slice: item, layout, defaultContent })
      : defaultContent;
  return (
    <TooltipAdapter
      {...native(slotProps.tooltip, ['ref'])}
      content={content}
      open={tooltipOpen && content !== null && content !== undefined && content !== false}
      onOpenChange={setTooltipOpen}
      disabled={active !== null && !item}
    >
      {({ ref: attach, ...trigger }) => {
        const restore = (target: Target | null) => {
          if (target?.element.isConnected && elements.current.get(target.id) === target.element) {
            setActive(target.id);
            attach(target.element);
          }
        };
        return (
          <svg
            {...native(slotProps.plot, ['role', 'aria-hidden', 'tabIndex'])}
            width={width}
            height={height}
            viewBox="-106 -106 212 212"
            preserveAspectRatio="xMidYMid meet"
            data-ui="pie-plot"
          >
            {layout.slices.map((slice) => {
              const slot = native(slotProps.slice?.(slice), ['aria-hidden', 'hidden']);
              const selected = active === slice.id;
              const path = getPiePath(slice, layout.radius, layout.innerRadius);
              return (
                <Fragment key={slice.id}>
                  {children && (
                    <g aria-hidden="true" pointerEvents="none" data-ui="pie-slice-drawing">
                      {children({
                        slice,
                        path,
                        radius: layout.radius,
                        innerRadius: layout.innerRadius,
                        active: selected && !!trigger['aria-describedby'],
                        defaultContent: (
                          <path d={path} className={slot.className} style={slot.style} />
                        ),
                      })}
                    </g>
                  )}
                  <path
                    {...slot}
                    key={slice.id}
                    ref={(element) => {
                      if (!element) return;
                      elements.current.set(slice.id, element);
                      return attachRef(element, slot.ref, () => elements.current.delete(slice.id));
                    }}
                    d={path}
                    style={
                      children
                        ? {
                            ...slot.style,
                            fillOpacity: 0,
                            strokeOpacity: 'var(--pie-hit-stroke-opacity, 0)',
                          }
                        : slot.style
                    }
                    data-custom={children ? true : undefined}
                    role="img"
                    tabIndex={0}
                    aria-label={`${slice.label || slice.id}: ${slice.value} (${percent(slice.share)})`}
                    aria-describedby={selected ? trigger['aria-describedby'] : undefined}
                    data-ui="pie-slice"
                    data-item-id={slice.id}
                    data-active={(selected && !!trigger['aria-describedby']) || undefined}
                    onPointerEnter={(event) => {
                      slot.onPointerEnter?.(event);
                      if (event.defaultPrevented) return;
                      hovered.current = { id: slice.id, element: event.currentTarget };
                      setActive(slice.id);
                      trigger.onPointerEnter?.(event);
                    }}
                    onPointerLeave={(event) => {
                      slot.onPointerLeave?.(event);
                      if (event.defaultPrevented) return;
                      hovered.current = null;
                      restore(focused.current);
                      trigger.onPointerLeave?.(event);
                    }}
                    onFocus={(event) => {
                      slot.onFocus?.(event);
                      if (event.defaultPrevented) return;
                      focused.current = { id: slice.id, element: event.currentTarget };
                      setActive(slice.id);
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
                      const next = getCollectionNavigation(navigation, slice.id, event.key, {
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
