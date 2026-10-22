import type { HeatmapCell } from '@dreadnought/core';
import { TableAdapter as Table } from '../../DataDisplay/Table/TableAdapter.tsx';
import { ChartPagination, useChartPage } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { HeatmapLabels, HeatmapSlotProps } from './heatmap.types.ts';

export function HeatmapDataTable({
  cells,
  label,
  labels,
  formatValue,
  slotProps,
  pageSize,
}: {
  cells: readonly HeatmapCell[];
  label: string;
  labels: Required<HeatmapLabels>;
  formatValue: (value: number) => string;
  slotProps: HeatmapSlotProps;
  pageSize: number;
}) {
  const page = useChartPage(cells, pageSize);
  return (
    <>
      <div {...native(slotProps.tableContainer)}>
        <Table
          {...native(slotProps.table, ['role', 'hidden', 'aria-hidden'])}
          data-ui="heatmap-table"
        >
          <caption>
            {label}: {labels.dataTable}
          </caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell scope="col">{labels.row}</Table.HeaderCell>
              <Table.HeaderCell scope="col">{labels.column}</Table.HeaderCell>
              <Table.HeaderCell scope="col">{labels.value}</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {page.rows.map((cell) => (
              <Table.Row key={cell.id}>
                <Table.HeaderCell scope="row">{cell.row.label || cell.row.id}</Table.HeaderCell>
                <Table.Cell>{cell.column.label || cell.column.id}</Table.Cell>
                <Table.Cell>
                  {cell.value === null ? labels.missing : formatValue(cell.value)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <ChartPagination {...page} slotProps={slotProps} />
    </>
  );
}
