import type { BoxPlotGroup } from '@dreadnought/core';
import { TableAdapter as Table } from '../../DataDisplay/Table/TableAdapter.tsx';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { BoxPlotLabels, BoxPlotSlotProps } from './boxPlot.types.ts';

export const boxPlotLabels: Required<BoxPlotLabels> = {
  group: 'Группа',
  count: 'Наблюдения',
  min: 'Минимум',
  q1: 'Q1',
  median: 'Медиана',
  q3: 'Q3',
  max: 'Максимум',
  lowerWhisker: 'Нижний ус',
  upperWhisker: 'Верхний ус',
  outliers: 'Выбросы',
  empty: 'Нет данных',
  dataTable: 'Статистика',
};

const keys = ['min', 'lowerWhisker', 'q1', 'median', 'q3', 'upperWhisker', 'max'] as const;
export function boxPlotStatistics(group: BoxPlotGroup, format: (value: number) => string) {
  return [
    ['count', String(group.count)],
    ...keys.map((key) => [key, group.summary ? format(group.summary[key]) : '—']),
    [
      'outliers',
      group.outliers.length
        ? group.outliers
            .map((item) => `${format(item.value)}${item.count > 1 ? ` × ${item.count}` : ''}`)
            .join('; ')
        : '—',
    ],
  ] as [keyof BoxPlotLabels, string][];
}

export function BoxPlotTooltip({
  group,
  labels,
  formatValue,
  slotProps,
}: {
  group: BoxPlotGroup;
  labels: Required<BoxPlotLabels>;
  formatValue: (value: number) => string;
  slotProps: BoxPlotSlotProps;
}) {
  return (
    <div data-ui="box-plot-tooltip-content">
      <span>
        <MarkAdapter {...native(slotProps.tooltipMark)} shape="circle" /> {group.label}
      </span>
      <table {...native(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
        <tbody>
          {boxPlotStatistics(group, formatValue).map(([key, value]) => (
            <tr key={key}>
              <th scope="row">{labels[key]}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BoxPlotDataTable({
  groups,
  label,
  labels,
  formatValue,
  slotProps,
}: {
  groups: readonly BoxPlotGroup[];
  label: string;
  labels: Required<BoxPlotLabels>;
  formatValue: (value: number) => string;
  slotProps: BoxPlotSlotProps;
}) {
  return (
    <div {...native(slotProps.tableContainer)}>
      <Table
        {...native(slotProps.table, ['role', 'hidden', 'aria-hidden'])}
        data-ui="box-plot-table"
      >
        <caption>
          {label}: {labels.dataTable}
        </caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell scope="col">{labels.group}</Table.HeaderCell>
            {(['count', ...keys, 'outliers'] as const).map((key) => (
              <Table.HeaderCell key={key} scope="col">
                {labels[key]}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {groups.map((group) => (
            <Table.Row key={group.id}>
              <Table.HeaderCell scope="row">{group.label}</Table.HeaderCell>
              {group.summary ? (
                boxPlotStatistics(group, formatValue).map(([key, value]) => (
                  <Table.Cell key={key}>{value}</Table.Cell>
                ))
              ) : (
                <Table.Cell colSpan={9}>{labels.empty}</Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
