import type { SankeyFlow, SankeyItem } from '@dreadnought/core';
import { TableAdapter as Table } from '../../DataDisplay/Table/TableAdapter.tsx';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { SankeyLabels, SankeySlotProps } from './sankey.types.ts';

export const sankeyLabels: Required<SankeyLabels> = {
  source: 'Откуда',
  target: 'Куда',
  value: 'Значение',
  incoming: 'Входящие',
  outgoing: 'Исходящие',
  empty: 'Нет данных',
  dataTable: 'Данные',
};
export interface SankeyStatisticsProps {
  labels: Required<SankeyLabels>;
  formatValue: (value: number) => string;
  slotProps: SankeySlotProps;
}
export function sankeyItemLabel(item: SankeyItem) {
  return item.kind === 'node' ? item.label : `${item.sourceLabel} → ${item.targetLabel}`;
}
export function SankeyTooltip({
  item,
  labels,
  formatValue,
  slotProps,
}: SankeyStatisticsProps & { item: SankeyItem }) {
  const rows =
    item.kind === 'node'
      ? [
          [labels.incoming, formatValue(item.incoming)],
          [labels.outgoing, formatValue(item.outgoing)],
          [labels.value, formatValue(item.value)],
        ]
      : [
          [labels.source, item.sourceLabel],
          [labels.target, item.targetLabel],
          [labels.value, formatValue(item.value)],
        ];
  return (
    <div
      data-ui="sankey-tooltip-content"
      data-color={(item.kind === 'node' ? item.index : item.sourceIndex) % 6}
    >
      <span>
        <MarkAdapter {...native(slotProps.tooltipMark)} shape="circle" />
        {sankeyItemLabel(item)}
      </span>
      <table {...native(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
        <tbody>
          {rows.map(([name, value], index) => (
            <tr key={index}>
              <th scope="row">{name}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function SankeyDataTable({
  links,
  label,
  labels,
  formatValue,
  slotProps,
}: SankeyStatisticsProps & { links: SankeyFlow[]; label: string }) {
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
            {[labels.source, labels.target, labels.value].map((name, index) => (
              <Table.HeaderCell key={index} scope="col">
                {name}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {links.map((link) => (
            <Table.Row key={link.id}>
              <Table.HeaderCell scope="row">{link.sourceLabel}</Table.HeaderCell>
              <Table.Cell>{link.targetLabel}</Table.Cell>
              <Table.Cell>{formatValue(link.value)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
