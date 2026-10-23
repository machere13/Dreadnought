import { useState } from 'react';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { GaugeTooltip, type GaugeViewProps } from './GaugeTooltip.tsx';

function arc(start: number, end: number) {
  const point = (angle: number) => `${80 * Math.cos(angle)},${80 * Math.sin(angle)}`;
  return `M${point(start)} A80,80 0 ${Number(end - start > Math.PI)} 1 ${point(end)}`;
}
export function GaugePlot(props: GaugeViewProps) {
  const { layout, active, label, labels, formatValue, slotProps } = props;
  const [open, setOpen] = useState(false);
  if (layout.value === null && open) setOpen(false);
  const slot = native(slotProps.plot, ['hidden', 'aria-hidden', 'aria-labelledby']);
  const reading = layout.value === null ? labels.empty : formatValue(layout.value);
  const accessible =
    `${label}: ${reading}; ${formatValue(layout.min)} — ${formatValue(layout.max)}` +
    (active ? `; ${active.label}` : '');
  return (
    <TooltipAdapter
      {...native(slotProps.tooltip, ['ref'])}
      disabled={layout.value === null}
      open={open && layout.value !== null}
      onOpenChange={setOpen}
      content={<GaugeTooltip {...props} />}
    >
      {(trigger) => (
        <span
          {...slot}
          {...trigger}
          role="img"
          tabIndex={layout.value === null ? -1 : 0}
          aria-label={accessible}
          data-ui="gauge-plot"
          data-color={active ? active.index % 6 : undefined}
          ref={(element) => {
            trigger.ref(element);
            if (!element) return;
            return attachRef(element, slot.ref, () => trigger.ref(null));
          }}
          onPointerEnter={(event) => {
            slot.onPointerEnter?.(event);
            if (!event.defaultPrevented) trigger.onPointerEnter?.(event);
          }}
          onPointerLeave={(event) => {
            slot.onPointerLeave?.(event);
            if (!event.defaultPrevented) trigger.onPointerLeave?.(event);
          }}
          onFocus={(event) => {
            slot.onFocus?.(event);
            if (!event.defaultPrevented) trigger.onFocus?.(event);
          }}
          onBlur={(event) => {
            slot.onBlur?.(event);
            if (!event.defaultPrevented) trigger.onBlur?.(event);
          }}
          onKeyDown={(event) => {
            slot.onKeyDown?.(event);
            if (!event.defaultPrevented && !event.nativeEvent.isComposing)
              trigger.onKeyDown?.(event);
          }}
          onClick={(event) => {
            slot.onClick?.(event);
            if (!event.defaultPrevented) event.currentTarget.focus();
          }}
        >
          <svg
            width="200"
            height={layout.variant === 'circle' ? 205 : 116}
            viewBox={`0 0 200 ${layout.variant === 'circle' ? 205 : 116}`}
            aria-hidden="true"
          >
            <g transform="translate(100 100)">
              <path
                d={arc(layout.startAngle, layout.endAngle)}
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
                data-ui="gauge-track"
              />
              {layout.segments.map((segment) => (
                <path
                  {...native(slotProps.segment?.(segment), ['aria-hidden', 'tabIndex', 'role'])}
                  key={segment.id}
                  d={arc(segment.startAngle, segment.endAngle)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  data-ui="gauge-segment"
                  data-color={segment.index % 6}
                />
              ))}
              {!layout.segments.length && layout.ratio !== null && layout.ratio > 0 && (
                <path
                  d={arc(
                    layout.startAngle,
                    layout.startAngle + layout.ratio * (layout.endAngle - layout.startAngle),
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  data-ui="gauge-fill"
                />
              )}
              {layout.needle && (
                <g data-ui="gauge-needle">
                  <line
                    x1="0"
                    y1="0"
                    x2={layout.needle.x * 58}
                    y2={layout.needle.y * 58}
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <circle r="5" fill="currentColor" />
                </g>
              )}
            </g>
          </svg>
          <span data-ui="gauge-limits" aria-hidden="true">
            <span>{formatValue(layout.min)}</span>
            <span>{formatValue(layout.max)}</span>
          </span>
          <strong data-ui="gauge-value" aria-hidden="true">
            {reading}
          </strong>
          {active && (
            <span data-ui="gauge-status" aria-hidden="true">
              {active.label}
            </span>
          )}
        </span>
      )}
    </TooltipAdapter>
  );
}
