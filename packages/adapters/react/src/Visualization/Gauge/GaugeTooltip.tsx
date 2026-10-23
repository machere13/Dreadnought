import type { GaugeSegment, GaugeLayout } from '@dreadnought/core';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { GaugeLabels, GaugeSlotProps } from './gauge.types.ts';

export const gaugeLabels: Required<GaugeLabels> = {
  value: 'Значение',
  min: 'Минимум',
  max: 'Максимум',
  status: 'Состояние',
  empty: 'Нет данных',
  thresholds: 'Диапазоны',
};
export interface GaugeViewProps {
  layout: GaugeLayout;
  active: GaugeSegment | undefined;
  label: string;
  labels: Required<GaugeLabels>;
  formatValue: (value: number) => string;
  slotProps: GaugeSlotProps;
}
export function GaugeTooltip({
  layout,
  active,
  label,
  labels,
  formatValue,
  slotProps,
}: GaugeViewProps) {
  const rows = [
    [labels.value, layout.value === null ? labels.empty : formatValue(layout.value)],
    [labels.min, formatValue(layout.min)],
    [labels.max, formatValue(layout.max)],
    ...(active ? [[labels.status, active.label]] : []),
  ];
  return (
    <div data-ui="gauge-tooltip-content" data-color={active ? active.index % 6 : undefined}>
      <span>
        <MarkAdapter {...native(slotProps.mark?.(active))} shape="circle" />
        {label}
      </span>
      <table {...native(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
        <tbody>
          {rows.map(([name, text], index) => (
            <tr key={index}>
              <th scope="row">{name}</th>
              <td>{text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
