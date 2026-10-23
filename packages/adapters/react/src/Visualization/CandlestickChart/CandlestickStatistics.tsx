import type { CandlestickCandle } from '@dreadnought/core';
import { TableAdapter as Table } from '../../DataDisplay/Table/TableAdapter.tsx';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type {
  CandlestickChartLabels,
  CandlestickChartSlotProps,
} from './candlestickChart.types.ts';

export const candlestickLabels: Required<CandlestickChartLabels> = {
  period: 'Период',
  open: 'Открытие',
  high: 'Максимум',
  low: 'Минимум',
  close: 'Закрытие',
  trend: 'Движение',
  up: 'Рост',
  down: 'Падение',
  flat: 'Без изменений',
  empty: 'Нет данных',
  dataTable: 'Данные',
};
export interface CandlestickStatisticsProps {
  labels: Required<CandlestickChartLabels>;
  formatValue: (value: number) => string;
  slotProps: CandlestickChartSlotProps;
}
const fields = ['open', 'high', 'low', 'close'] as const;
export function candleDescription(
  candle: CandlestickCandle,
  { labels, formatValue }: CandlestickStatisticsProps,
) {
  return (
    `${candle.label}: ${labels[candle.trend]}; ` +
    fields.map((field) => `${labels[field]} ${formatValue(candle[field])}`).join('; ')
  );
}
export function CandlestickTooltip({
  candle,
  labels,
  formatValue,
  slotProps,
}: CandlestickStatisticsProps & { candle: CandlestickCandle }) {
  return (
    <div data-ui="candlestick-tooltip-content" data-trend={candle.trend}>
      <span>
        <MarkAdapter {...native(slotProps.tooltipMark)} shape="circle" />
        {candle.label}
      </span>
      <table {...native(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
        <tbody>
          {fields.map((field) => (
            <tr key={field}>
              <th scope="row">{labels[field]}</th>
              <td>{formatValue(candle[field])}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">{labels.trend}</th>
            <td>{labels[candle.trend]}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export function CandlestickDataTable({
  candles,
  label,
  labels,
  formatValue,
  slotProps,
}: CandlestickStatisticsProps & { candles: CandlestickCandle[]; label: string }) {
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
            {[labels.period, ...fields.map((field) => labels[field]), labels.trend].map(
              (name, index) => (
                <Table.HeaderCell key={index} scope="col">
                  {name}
                </Table.HeaderCell>
              ),
            )}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {candles.map((candle) => (
            <Table.Row key={candle.id}>
              <Table.HeaderCell scope="row">{candle.label}</Table.HeaderCell>
              {fields.map((field) => (
                <Table.Cell key={field}>{formatValue(candle[field])}</Table.Cell>
              ))}
              <Table.Cell>{labels[candle.trend]}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
