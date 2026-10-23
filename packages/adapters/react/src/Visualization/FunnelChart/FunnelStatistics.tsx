import type { FunnelStage } from '@dreadnought/core';
import { TableAdapter as Table } from '../../DataDisplay/Table/TableAdapter.tsx';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { FunnelChartLabels, FunnelChartSlotProps } from './funnelChart.types.ts';

export const funnelLabels: Required<FunnelChartLabels> = {
  stage: 'Этап',
  value: 'Количество',
  fromFirst: 'От первого',
  fromPrevious: 'От предыдущего',
  drop: 'Потеря',
  empty: 'Нет данных',
  dataTable: 'Данные',
};
const keys = ['value', 'fromFirst', 'fromPrevious', 'drop'] as const;
export interface FunnelStatisticsProps {
  labels: Required<FunnelChartLabels>;
  formatValue: (value: number) => string;
  formatPercent: (ratio: number) => string;
  slotProps: FunnelChartSlotProps;
}

function statistics(stage: FunnelStage, { formatValue, formatPercent }: FunnelStatisticsProps) {
  return keys.map((key) => {
    const value = stage[key];
    const format = key === 'fromFirst' || key === 'fromPrevious' ? formatPercent : formatValue;
    return [key, value === null ? '—' : format(value)] as const;
  });
}

export function FunnelTooltip({ stage, ...props }: FunnelStatisticsProps & { stage: FunnelStage }) {
  return (
    <div data-ui="funnel-tooltip-content">
      <span>
        <MarkAdapter {...native(props.slotProps.tooltipMark)} shape="circle" />
        {stage.label}
      </span>
      <table {...native(props.slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
        <tbody>
          {statistics(stage, props).map(([key, value]) => (
            <tr key={key}>
              <th scope="row">{props.labels[key]}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FunnelDataTable({
  stages,
  label,
  ...props
}: FunnelStatisticsProps & { stages: readonly FunnelStage[]; label: string }) {
  return (
    <div {...native(props.slotProps.tableContainer)}>
      <Table
        {...native(props.slotProps.table, ['role', 'hidden', 'aria-hidden'])}
        data-ui="funnel-table"
      >
        <caption>
          {label}: {props.labels.dataTable}
        </caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell scope="col">{props.labels.stage}</Table.HeaderCell>
            {keys.map((key) => (
              <Table.HeaderCell key={key} scope="col">
                {props.labels[key]}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {stages.map((stage) => (
            <Table.Row key={stage.id}>
              <Table.HeaderCell scope="row">{stage.label}</Table.HeaderCell>
              {statistics(stage, props).map(([key, value]) => (
                <Table.Cell key={key}>{value}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
