import type { WaterfallStep } from '@dreadnought/core';
import { TableAdapter as Table } from '../../DataDisplay/Table/TableAdapter.tsx';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { WaterfallChartLabels, WaterfallChartSlotProps } from './waterfallChart.types.ts';

export const waterfallLabels: Required<WaterfallChartLabels> = {
  step: 'Шаг',
  kind: 'Тип',
  start: 'Начало',
  change: 'Изменение',
  total: 'Итог',
  value: 'Значение',
  before: 'До шага',
  after: 'После шага',
  empty: 'Нет данных',
  dataTable: 'Данные',
};
export interface WaterfallStatisticsProps {
  labels: Required<WaterfallChartLabels>;
  formatValue: (value: number) => string;
  slotProps: WaterfallChartSlotProps;
}
export function waterfallValue(step: WaterfallStep, format: (value: number) => string) {
  if (step.kind !== 'change' || step.value === 0) return format(step.value);
  return `${step.value > 0 ? '+' : '−'}${format(Math.abs(step.value))}`;
}
export function WaterfallTooltip({
  step,
  labels,
  formatValue,
  slotProps,
}: WaterfallStatisticsProps & { step: WaterfallStep }) {
  return (
    <div data-ui="waterfall-tooltip-content" data-tone={step.tone}>
      <span>
        <MarkAdapter {...native(slotProps.tooltipMark)} shape="circle" />
        {step.label}
      </span>
      <table {...native(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
        <tbody>
          <tr>
            <th scope="row">{labels.kind}</th>
            <td>{labels[step.kind]}</td>
          </tr>
          <tr>
            <th scope="row">{labels.value}</th>
            <td>{waterfallValue(step, formatValue)}</td>
          </tr>
          <tr>
            <th scope="row">{labels.before}</th>
            <td>{formatValue(step.before)}</td>
          </tr>
          <tr>
            <th scope="row">{labels.after}</th>
            <td>{formatValue(step.after)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export function WaterfallDataTable({
  steps,
  label,
  labels,
  formatValue,
  slotProps,
}: WaterfallStatisticsProps & { steps: WaterfallStep[]; label: string }) {
  return (
    <div
      {...native(slotProps.tableContainer)}
      onFocusCapture={(event) => {
        slotProps.tableContainer?.onFocusCapture?.(event);
        if (!event.defaultPrevented)
          (event.target as HTMLElement).scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      }}
    >
      <Table {...native(slotProps.table, ['role', 'hidden', 'aria-hidden'])}>
        <caption>
          {label}: {labels.dataTable}
        </caption>
        <Table.Head>
          <Table.Row>
            {[labels.step, labels.kind, labels.value, labels.before, labels.after].map(
              (name, index) => (
                <Table.HeaderCell key={index} scope="col">
                  {name}
                </Table.HeaderCell>
              ),
            )}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {steps.map((step) => (
            <Table.Row key={step.id}>
              <Table.HeaderCell scope="row">{step.label}</Table.HeaderCell>
              <Table.Cell>{labels[step.kind]}</Table.Cell>
              <Table.Cell>{waterfallValue(step, formatValue)}</Table.Cell>
              <Table.Cell>{formatValue(step.before)}</Table.Cell>
              <Table.Cell>{formatValue(step.after)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
