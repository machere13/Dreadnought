import { useId } from 'react';
import { buildGaugeLayout } from '@dreadnought/core';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { GaugePlot } from './GaugePlot.tsx';
import { gaugeLabels } from './GaugeTooltip.tsx';
import type { GaugeAdapterProps } from './gauge.types.ts';

export function GaugeAdapter({
  value,
  min,
  max,
  variant,
  thresholds,
  label,
  description,
  formatValue = String,
  labels: overrides = {},
  slotProps = {},
  ...rest
}: GaugeAdapterProps) {
  const layout = buildGaugeLayout({ value, min, max, variant, thresholds });
  const labels = { ...gaugeLabels, ...overrides };
  if ([label, ...Object.values(labels)].some((text) => typeof text !== 'string' || !text.trim()))
    throw new TypeError('Gauge labels must be nonempty strings');
  if (typeof formatValue !== 'function')
    throw new TypeError('Gauge formatValue must be a function');
  if (description !== undefined && typeof description !== 'string')
    throw new TypeError('Gauge description must be a string');
  const id = useId();
  const active = layout.segments.find((segment) => segment.id === layout.activeSegmentId);
  return (
    <figure
      {...native(rest, ['role'])}
      data-ui="gauge"
      data-variant={layout.variant}
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <GaugePlot
        layout={layout}
        active={active}
        label={label}
        labels={labels}
        formatValue={formatValue}
        slotProps={slotProps}
      />
      {layout.segments.length > 0 && (
        <ul {...native(slotProps.legend, ['role', 'aria-label'])} aria-label={labels.thresholds}>
          {layout.segments.map((segment) => (
            <li
              {...native(slotProps.band?.(segment), ['aria-current'])}
              key={segment.id}
              data-color={segment.index % 6}
              aria-current={segment.id === active?.id ? 'true' : undefined}
            >
              <MarkAdapter {...native(slotProps.mark?.(segment))} shape="circle" />
              <span>{segment.label}</span>
              <span>
                {formatValue(segment.from)} — {formatValue(segment.to)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
