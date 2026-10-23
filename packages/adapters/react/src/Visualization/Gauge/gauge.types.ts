import type { GaugeLayoutOptions, GaugeSegment } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';

export interface GaugeLabels {
  value?: string;
  min?: string;
  max?: string;
  status?: string;
  empty?: string;
  thresholds?: string;
}
export interface GaugeSlotProps {
  plot?: Native<'span', 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'>;
  segment?: (segment: GaugeSegment) => Native<'path', 'd' | 'aria-hidden' | 'tabIndex' | 'role'>;
  legend?: Native<'ul', 'role' | 'aria-label'>;
  band?: (segment: GaugeSegment) => Native<'li', 'aria-current'>;
  mark?: (segment: GaugeSegment | undefined) => Native<'span', 'aria-hidden'>;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
}
export type GaugeAdapterProps = Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'> &
  GaugeLayoutOptions & {
    label: string;
    description?: string;
    formatValue?: (value: number) => string;
    labels?: GaugeLabels;
    slotProps?: GaugeSlotProps;
  };
