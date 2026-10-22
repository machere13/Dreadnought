import type { ScatterPoint } from '@dreadnought/core';
import { TableAdapter as Table } from '../../DataDisplay/Table/TableAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { ChartPagination, useChartPage } from '../../shared/useChartPage.tsx';
import type {
  ScatterChartLabels,
  ScatterChartSlotProps,
  ScatterFormat,
} from './scatterChart.types.ts';

export function ScatterDataTable({
  rows,
  seriesNames,
  label,
  labels,
  format,
  slotProps,
  pageSize,
}: {
  rows: readonly ScatterPoint[];
  seriesNames: ReadonlyMap<string, string>;
  label: string;
  labels: ScatterChartLabels;
  format: ScatterFormat;
  slotProps: ScatterChartSlotProps;
  pageSize: number;
}) {
  const page = useChartPage(rows, pageSize);
  const hasSize = rows.some((point) => point.value.size !== undefined);
  return (
    <>
      <Table
        {...native(slotProps.table, ['role', 'aria-hidden', 'hidden'])}
        data-ui="scatter-table"
      >
        <caption>
          {label}: {labels.dataTable ?? 'Все исходные данные'}
        </caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell scope="col">{labels.series ?? 'Серия'}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{labels.observation ?? 'Наблюдение'}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{format.xLabel}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{format.yLabel}</Table.HeaderCell>
            {hasSize && <Table.HeaderCell scope="col">{format.sizeLabel}</Table.HeaderCell>}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {page.rows.map((point) => (
            <Table.Row key={JSON.stringify([point.seriesId, point.id])}>
              <Table.Cell>{seriesNames.get(point.seriesId)}</Table.Cell>
              <Table.HeaderCell scope="row">{point.value.label || point.id}</Table.HeaderCell>
              <Table.Cell>{format.formatX(point.value.x)}</Table.Cell>
              <Table.Cell>{format.formatY(point.value.y)}</Table.Cell>
              {hasSize && (
                <Table.Cell>
                  {point.value.size === undefined ? '—' : format.formatSize(point.value.size)}
                </Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <ChartPagination {...page} slotProps={slotProps} />
    </>
  );
}
