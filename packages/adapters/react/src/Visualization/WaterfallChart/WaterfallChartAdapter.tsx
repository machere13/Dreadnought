import { useId, useMemo, useState } from 'react';
import { buildWaterfallLayout } from '@dreadnought/core';
import { ChartPagination, useChartPage } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { WaterfallPlot } from './WaterfallPlot.tsx';
import { WaterfallDataTable, waterfallLabels } from './WaterfallStatistics.tsx';
import type { WaterfallChartAdapterProps } from './waterfallChart.types.ts';

export function WaterfallChartAdapter({
  data,
  domain,
  label,
  description,
  formatValue = String,
  pageSize = 12,
  labels: overrides = {},
  slotProps = {},
  ...rest
}: WaterfallChartAdapterProps) {
  const layout = useMemo(() => buildWaterfallLayout({ data, domain }), [data, domain]);
  const [version, setVersion] = useState({ layout, revision: 0 });
  const revision = version.layout === layout ? version.revision : version.revision + 1;
  if (version.layout !== layout) setVersion({ layout, revision });
  const labels = { ...waterfallLabels, ...overrides };
  if (
    [label, ...Object.values(labels)].some((value) => typeof value !== 'string' || !value.trim())
  ) {
    throw new TypeError('Waterfall labels must be nonempty strings');
  }
  if (typeof formatValue !== 'function')
    throw new TypeError('Waterfall formatValue must be a function');
  if (description !== undefined && typeof description !== 'string')
    throw new TypeError('Waterfall description must be a string');
  const id = useId();
  const page = useChartPage(layout.steps, pageSize);
  const statistics = { labels, formatValue, slotProps };
  return (
    <figure
      {...native(rest, ['role'])}
      data-ui="waterfall-chart"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      {layout.steps.length ? (
        <WaterfallPlot
          key={`${revision}:${page.page}`}
          layout={layout}
          steps={page.rows}
          {...statistics}
        />
      ) : (
        <p>{labels.empty}</p>
      )}
      <WaterfallDataTable steps={page.rows} label={label} {...statistics} />
      <ChartPagination {...page} slotProps={slotProps} />
    </figure>
  );
}
