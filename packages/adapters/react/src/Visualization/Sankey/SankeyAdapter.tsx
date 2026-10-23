import { useId, useMemo, useState } from 'react';
import { buildSankeyLayout } from '@dreadnought/core';
import { ChartPagination, useChartPage } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { SankeyPlot } from './SankeyPlot.tsx';
import { SankeyDataTable, sankeyLabels } from './SankeyStatistics.tsx';
import type { SankeyAdapterProps } from './sankey.types.ts';

export function SankeyAdapter({
  nodes,
  links,
  label,
  description,
  nodeGap,
  formatValue = String,
  pageSize = 20,
  labels: overrides = {},
  slotProps = {},
  ...rest
}: SankeyAdapterProps) {
  const layout = useMemo(
    () => buildSankeyLayout({ nodes, links, nodeGap }),
    [nodes, links, nodeGap],
  );
  const [version, setVersion] = useState({ layout, revision: 0 });
  const revision = version.layout === layout ? version.revision : version.revision + 1;
  if (version.layout !== layout) setVersion({ layout, revision });
  const labels = { ...sankeyLabels, ...overrides };
  if ([label, ...Object.values(labels)].some((value) => typeof value !== 'string' || !value.trim()))
    throw new TypeError('Sankey labels must be nonempty strings');
  if (typeof formatValue !== 'function')
    throw new TypeError('Sankey formatValue must be a function');
  if (description !== undefined && typeof description !== 'string')
    throw new TypeError('Sankey description must be a string');
  const id = useId();
  const page = useChartPage(layout.links, pageSize);
  const statistics = { labels, formatValue, slotProps };
  return (
    <figure
      {...native(rest, ['role'])}
      data-ui="sankey"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      {layout.nodes.length ? (
        <SankeyPlot key={revision} layout={layout} {...statistics} />
      ) : (
        <p>{labels.empty}</p>
      )}
      <SankeyDataTable links={page.rows} label={label} {...statistics} />
      <ChartPagination {...page} slotProps={slotProps} />
    </figure>
  );
}
