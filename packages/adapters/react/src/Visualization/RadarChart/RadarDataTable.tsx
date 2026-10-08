import type { RadarMetric, RadarSeries } from '@dreadnought/core';
import { TableAdapter } from '../../DataDisplay/Table/TableAdapter.tsx';
import {
  radarNativeProps,
  type RadarChartLabels,
  type RadarChartSlotProps,
} from './radarChart.types.ts';

type Props = {
  metrics: readonly RadarMetric[];
  series: readonly RadarSeries[];
  label: string;
  labels: RadarChartLabels;
  tableProps: RadarChartSlotProps['table'];
};
export function RadarDataTable({ metrics, series, label, labels, tableProps }: Props) {
  return (
    <TableAdapter {...radarNativeProps(tableProps, ['aria-hidden', 'hidden', 'role'])}>
      <caption>
        {label}: {labels.dataTable}
      </caption>
      <TableAdapter.Head>
        <TableAdapter.Row>
          {[labels.metric, labels.domain, labels.direction].map((text, index) => (
            <TableAdapter.HeaderCell key={index} scope="col">
              {text}
            </TableAdapter.HeaderCell>
          ))}
          {series.map((item) => (
            <TableAdapter.HeaderCell key={item.id} scope="col">
              {item.label || item.id}
            </TableAdapter.HeaderCell>
          ))}
        </TableAdapter.Row>
      </TableAdapter.Head>
      <TableAdapter.Body>
        {metrics.map((metric) => (
          <TableAdapter.Row key={metric.id}>
            <TableAdapter.HeaderCell scope="row">
              {metric.label || metric.id}
            </TableAdapter.HeaderCell>
            <TableAdapter.Cell>
              {metric.domain[0]} — {metric.domain[1]}
            </TableAdapter.Cell>
            <TableAdapter.Cell>
              {metric.reverse ? labels.decreasing : labels.increasing}
            </TableAdapter.Cell>
            {series.map((item) => (
              <TableAdapter.Cell key={item.id}>{item.values[metric.id]}</TableAdapter.Cell>
            ))}
          </TableAdapter.Row>
        ))}
      </TableAdapter.Body>
    </TableAdapter>
  );
}
