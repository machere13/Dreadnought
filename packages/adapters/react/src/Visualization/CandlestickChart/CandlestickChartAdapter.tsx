import { useId, useMemo, useState } from 'react';
import { buildCandlestickLayout } from '@dreadnought/core';
import { ChartPagination, useChartPage } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { CandlestickPlot } from './CandlestickPlot.tsx';
import { CandlestickDataTable, candlestickLabels } from './CandlestickStatistics.tsx';
import type { CandlestickChartAdapterProps } from './candlestickChart.types.ts';

export function CandlestickChartAdapter({
  data,
  domain,
  label,
  description,
  formatValue = String,
  pageSize = 12,
  labels: overrides = {},
  slotProps = {},
  ...rest
}: CandlestickChartAdapterProps) {
  const layout = useMemo(() => buildCandlestickLayout({ data, domain }), [data, domain]);
  const [version, setVersion] = useState({ layout, revision: 0 });
  const revision = version.layout === layout ? version.revision : version.revision + 1;
  if (version.layout !== layout) setVersion({ layout, revision });
  const labels = { ...candlestickLabels, ...overrides };
  if (
    [label, ...Object.values(labels)].some((value) => typeof value !== 'string' || !value.trim())
  ) {
    throw new TypeError('Candlestick labels must be nonempty strings');
  }
  if (typeof formatValue !== 'function')
    throw new TypeError('Candlestick formatValue must be a function');
  if (description !== undefined && typeof description !== 'string')
    throw new TypeError('Candlestick description must be a string');
  const id = useId();
  const page = useChartPage(layout.candles, pageSize);
  const statistics = { labels, formatValue, slotProps };
  return (
    <figure
      {...native(rest, ['role'])}
      data-ui="candlestick-chart"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      {layout.candles.length ? (
        <CandlestickPlot
          key={`${revision}:${page.page}`}
          layout={layout}
          candles={page.rows}
          {...statistics}
        />
      ) : (
        <p>{labels.empty}</p>
      )}
      <CandlestickDataTable candles={page.rows} label={label} {...statistics} />
      <ChartPagination {...page} slotProps={slotProps} />
    </figure>
  );
}
