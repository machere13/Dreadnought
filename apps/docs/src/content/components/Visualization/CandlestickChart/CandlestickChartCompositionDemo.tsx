import { Button, CandlestickChart, Table, useCandlestickChart } from '@dreadnought/ui/react';

const data = [
  { id: 'mon', label: 'Пн', open: 100, high: 120, low: 90, close: 110 },
  { id: 'tue', label: 'Вт', open: 110, high: 115, low: 80, close: 100 },
  { id: 'wed', label: 'Ср', open: 105, high: 130, low: 100, close: 105 },
  { id: 'thu', label: 'Чт', open: 105, high: 140, low: 95, close: 125 },
];

function Prices() {
  const { candles, page, labels, formatValue, slotProps, label } = useCandlestickChart();
  return (
    <>
      <p>
        Страница {page.page} из {page.count}. Шкала общая для всех периодов.
      </p>
      <Button disabled={page.page === page.count} onClick={() => page.change(page.page + 1)}>
        Следующие периоды
      </Button>
      <div
        {...slotProps.tableContainer}
        onFocusCapture={(event) => {
          slotProps.tableContainer?.onFocusCapture?.(event);
          if (!event.defaultPrevented)
            (event.target as HTMLElement).scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
        }}
      >
        <Table {...slotProps.table}>
          <caption>{label}: цены</caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell scope="col">{labels.period}</Table.HeaderCell>
              {(['open', 'high', 'low', 'close'] as const).map((field) => (
                <Table.HeaderCell key={field} scope="col">
                  {labels[field]}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {candles.map((candle) => (
              <Table.Row key={candle.id}>
                <Table.HeaderCell scope="row">{candle.label}</Table.HeaderCell>
                {(['open', 'high', 'low', 'close'] as const).map((field) => (
                  <Table.Cell key={field}>{formatValue(candle[field])}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </>
  );
}

export function CandlestickChartCompositionDemo() {
  return (
    <CandlestickChart data={data} label="OHLC-бары вместо свечей" pageSize={2}>
      <CandlestickChart.Plot
        height={180}
        tooltipContent={({ defaultContent }) => <div>OHLC-бар{defaultContent}</div>}
      >
        {({ candle, height, formatValue }) => (
          <>
            <svg
              width="100%"
              height={height}
              viewBox="0 -2 100 104"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ display: 'block', marginInline: 'auto', maxWidth: '3rem' }}
            >
              <path
                d={`M50 ${candle.highY} V${candle.lowY} M20 ${candle.openY} H50 M50 ${candle.closeY} H80`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span data-ui="candlestick-candle-label">
              {candle.label}
              <span>{formatValue(candle.close)}</span>
            </span>
          </>
        )}
      </CandlestickChart.Plot>
      <CandlestickChart.Empty />
      <Prices />
      <CandlestickChart.Pagination />
    </CandlestickChart>
  );
}
