import { useId, useMemo } from 'react';
import { buildBoxPlotLayout } from '@dreadnought/core';
import { useChartPage } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { boxPlotLabels } from './BoxPlotStatistics.tsx';
import { BoxPlotContext } from './BoxPlotContext.tsx';
import { BoxPlotPlotAdapter } from './BoxPlotPlot.tsx';
import {
  BoxPlotAxisAdapter,
  BoxPlotTableAdapter,
  BoxPlotPaginationAdapter,
  BoxPlotEmptyAdapter,
} from './BoxPlotParts.tsx';
import type { BoxPlotAdapterProps } from './boxPlot.types.ts';

function BoxPlotRootAdapter({
  data,
  domain,
  label,
  description,
  valueLabel = 'Значение',
  formatValue = String,
  pageSize = 20,
  labels: overrides = {},
  slotProps = {},
  children,
  ...rest
}: BoxPlotAdapterProps) {
  const layout = useMemo(
    () => buildBoxPlotLayout({ data, domain }),
    [data, domain?.[0], domain?.[1]],
  );
  const labels = { ...boxPlotLabels, ...overrides };
  if (
    [label, valueLabel, ...Object.values(labels)].some(
      (value) => typeof value !== 'string' || !value.trim(),
    )
  ) {
    throw new TypeError('BoxPlot labels must be nonempty strings');
  }
  if (typeof formatValue !== 'function')
    throw new TypeError('BoxPlot formatter must be a function');
  if (description !== undefined && typeof description !== 'string')
    throw new TypeError('BoxPlot description must be a string');
  const id = useId();
  const page = useChartPage(layout.groups, pageSize);
  const context = { layout, page, label, labels, valueLabel, formatValue, slotProps };
  return (
    <figure
      {...native(rest, ['role'])}
      data-ui="box-plot"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <BoxPlotContext.Provider value={context}>
        {children === undefined ? (
          <>
            <BoxPlotEmptyAdapter />
            <BoxPlotPlotAdapter />
            <BoxPlotAxisAdapter />
            <BoxPlotTableAdapter />
            <BoxPlotPaginationAdapter />
          </>
        ) : (
          children
        )}
      </BoxPlotContext.Provider>
    </figure>
  );
}

export const BoxPlotAdapter = Object.assign(BoxPlotRootAdapter, {
  Plot: BoxPlotPlotAdapter,
  Axis: BoxPlotAxisAdapter,
  Table: BoxPlotTableAdapter,
  Pagination: BoxPlotPaginationAdapter,
  Empty: BoxPlotEmptyAdapter,
});
