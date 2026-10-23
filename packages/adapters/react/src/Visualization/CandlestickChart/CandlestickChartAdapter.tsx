import { useId, useMemo, useState } from 'react';
import { buildCandlestickLayout } from '@dreadnought/core';
import { useChartPage } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { candlestickLabels } from './CandlestickStatistics.tsx';
import { CandlestickChartContext } from './CandlestickChartContext.tsx';
import {
  CandlestickChartPlotAdapter,
  CandlestickChartTableAdapter,
  CandlestickChartPaginationAdapter,
} from './CandlestickChartParts.tsx';
import type { CandlestickChartAdapterProps } from './candlestickChart.types.ts';

function CandlestickChartRootAdapter({
  data,
  domain,
  label,
  description,
  formatValue = String,
  pageSize = 12,
  labels: overrides = {},
  slotProps = {},
  children,
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
  const context = {
    layout,
    candles: page.rows,
    page,
    label,
    labels,
    formatValue,
    slotProps,
    plotKey: `${revision}:${page.page}:${pageSize}`,
  };
  return (
    <figure
      {...native(rest, ['role'])}
      data-ui="candlestick-chart"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <CandlestickChartContext.Provider value={context}>
        {children === undefined ? (
          <>
            <CandlestickChartPlotAdapter />
            <CandlestickChartTableAdapter />
            <CandlestickChartPaginationAdapter />
          </>
        ) : (
          children
        )}
      </CandlestickChartContext.Provider>
    </figure>
  );
}

export const CandlestickChartAdapter = Object.assign(CandlestickChartRootAdapter, {
  Plot: CandlestickChartPlotAdapter,
  Table: CandlestickChartTableAdapter,
  Pagination: CandlestickChartPaginationAdapter,
});
