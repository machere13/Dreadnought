import { useId } from 'react';
import { buildGaugeLayout } from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { GaugeContext } from './GaugeContext.tsx';
import { GaugePlotAdapter, GaugeLegendAdapter } from './GaugeParts.tsx';
import { gaugeLabels } from './GaugeTooltip.tsx';
import type { GaugeAdapterProps } from './gauge.types.ts';

function GaugeRootAdapter({
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
  children,
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
      <GaugeContext.Provider value={{ layout, active, label, labels, formatValue, slotProps }}>
        {children === undefined ? (
          <>
            <GaugePlotAdapter />
            <GaugeLegendAdapter />
          </>
        ) : (
          children
        )}
      </GaugeContext.Provider>
    </figure>
  );
}

export const GaugeAdapter = Object.assign(GaugeRootAdapter, {
  Plot: GaugePlotAdapter,
  Legend: GaugeLegendAdapter,
});
