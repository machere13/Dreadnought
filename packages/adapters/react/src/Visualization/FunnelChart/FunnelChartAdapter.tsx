import { useId, useMemo } from 'react';
import { buildFunnelLayout } from '@dreadnought/core';
import { useChartPage } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { FunnelChartContext } from './FunnelChartContext.tsx';
import { FunnelChartPlotAdapter } from './FunnelChartPlot.tsx';
import {
  FunnelChartTableAdapter,
  FunnelChartPaginationAdapter,
  FunnelChartEmptyAdapter,
} from './FunnelChartParts.tsx';
import { funnelLabels } from './FunnelStatistics.tsx';
import type { FunnelChartAdapterProps } from './funnelChart.types.ts';

const percent = (ratio: number) => `${Number((ratio * 100).toFixed(1))}%`;

function FunnelChartRootAdapter({
  data,
  label,
  description,
  formatValue = String,
  formatPercent = percent,
  pageSize = 20,
  labels: overrides = {},
  slotProps = {},
  children,
  ...rest
}: FunnelChartAdapterProps) {
  const layout = useMemo(() => buildFunnelLayout({ data }), [data]);
  const labels = { ...funnelLabels, ...overrides };
  if (
    [label, ...Object.values(labels)].some((value) => typeof value !== 'string' || !value.trim())
  ) {
    throw new TypeError('Funnel labels must be nonempty strings');
  }
  if (typeof formatValue !== 'function' || typeof formatPercent !== 'function') {
    throw new TypeError('Funnel formatters must be functions');
  }
  if (description !== undefined && typeof description !== 'string') {
    throw new TypeError('Funnel description must be a string');
  }
  const id = useId();
  const page = useChartPage(layout.stages, pageSize);
  const context = { layout, page, label, labels, formatValue, formatPercent, slotProps };
  return (
    <figure
      {...native(rest, ['role'])}
      data-ui="funnel-chart"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <FunnelChartContext.Provider value={context}>
        {children === undefined ? (
          <>
            <FunnelChartEmptyAdapter />
            <FunnelChartPlotAdapter />
            <FunnelChartTableAdapter />
            <FunnelChartPaginationAdapter />
          </>
        ) : (
          children
        )}
      </FunnelChartContext.Provider>
    </figure>
  );
}

export const FunnelChartAdapter = Object.assign(FunnelChartRootAdapter, {
  Plot: FunnelChartPlotAdapter,
  Table: FunnelChartTableAdapter,
  Pagination: FunnelChartPaginationAdapter,
  Empty: FunnelChartEmptyAdapter,
});
