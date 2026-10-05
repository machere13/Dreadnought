import { useCallback, useId, useRef, useState } from 'react';
import { buildLineLayout, getSelectionValue } from '@dreadnought/core';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { TableAdapter } from '../../DataDisplay/Table/index.ts';
import { LinePlot } from './LinePlot.tsx';
import type { LineChartAdapterProps } from './lineChart.types.ts';

export function LineChartAdapter({ label, description, series, xDomain, yDomain, width, height, xLabel = 'X', yLabel = 'Y',
  formatX = String, formatY = String, visibleSeries, defaultVisibleSeries, onVisibleSeriesChange, labels = {}, slotProps = {}, ...native }: LineChartAdapterProps) {
  buildLineLayout({ series, xDomain, yDomain, width: 1, height: 1 });
  if ([label, xLabel, yLabel, ...Object.values(labels)].some(value => typeof value !== 'string' || !value.trim())) throw new TypeError('Line labels must be nonempty strings');
  if (description !== undefined && typeof description !== 'string') throw new TypeError('Line description must be a string');
  if (typeof formatX !== 'function' || typeof formatY !== 'function') throw new TypeError('Line formatters must be functions');
  if (width !== undefined || height !== undefined) {
    if (!Number.isFinite(width) || !Number.isFinite(height)) throw new TypeError('Line requires finite dimensions together');
    if (width! <= 0 || height! <= 0) throw new RangeError('Line dimensions must be positive');
  }
  for (const value of [visibleSeries, defaultVisibleSeries]) if (value !== undefined) {
    if (!Array.isArray(value) || value.some(id => typeof id !== 'string')) throw new TypeError('Line visibility must be an array of strings');
    if (new Set(value).size !== value.length) throw new RangeError('Line visibility must contain unique IDs');
  }
  const id = useId(), plotRef = useRef<HTMLDivElement>(null);
  const consumerRef = slotProps.plotContainer?.ref;
  const attachPlot = useCallback((element: HTMLDivElement | null) => {
    plotRef.current = element;
    if (element) return attachRef(element, consumerRef, () => { plotRef.current = null; });
  }, [consumerRef]);
  const viewport = useChartViewport(width, height, plotRef);
  const [internal, setInternal] = useState<readonly string[]>(() => [...(defaultVisibleSeries ?? series.map(item => item.id))]);
  const visible = (visibleSeries ?? internal).filter(id => series.some(item => item.id === id));
  const xs = [...new Set(series.flatMap(item => item.data.map(point => point.x)))].sort((a, b) => a - b);
  function toggle(value: string) {
    const next = getSelectionValue(visible, { type: 'toggle', value });
    if (visibleSeries === undefined) setInternal([...next]);
    onVisibleSeriesChange?.([...next]);
  }
  return <figure {...nativeProps(native, ['role'])} aria-labelledby={`${id}-label`} aria-describedby={description !== undefined ? `${id}-description` : undefined} data-ui="line-chart">
    <figcaption id={`${id}-label`}>{label}</figcaption>
    {description !== undefined && <p id={`${id}-description`}>{description}</p>}
    <div {...nativeProps(slotProps.plotContainer)} ref={attachPlot} data-ui="line-plot-container">
      {viewport && <LinePlot {...viewport} series={series} xDomain={xDomain} yDomain={yDomain} visible={visible}
        slotProps={slotProps} formatX={formatX} formatY={formatY} xLabel={xLabel} yLabel={yLabel} />}
    </div>
    <div {...nativeProps(slotProps.legend)} role="group" aria-label={labels.legend ?? 'Серии'} data-ui="line-legend">
      {series.map(item => {
        const slot = nativeProps(slotProps.legendButton?.(item), ['aria-label', 'aria-labelledby', 'disabled']);
        return <button {...slot} key={item.id} type="button" aria-pressed={visible.includes(item.id)} data-ui="line-legend-button" data-series-id={item.id}
          onClick={event => { slot.onClick?.(event); if (!event.defaultPrevented) toggle(item.id); }}>{item.label || item.id}</button>;
      })}
    </div>
    <TableAdapter {...nativeProps(slotProps.table, ['role', 'aria-hidden', 'hidden'])}>
      <caption>{label}: {labels.dataTable ?? 'Данные'}</caption>
      <TableAdapter.Head><TableAdapter.Row><TableAdapter.HeaderCell scope="col">{xLabel}</TableAdapter.HeaderCell>
        {series.map(item => <TableAdapter.HeaderCell key={item.id} scope="col">{item.label || item.id} ({yLabel})</TableAdapter.HeaderCell>)}
      </TableAdapter.Row></TableAdapter.Head>
      <TableAdapter.Body>{xs.map(x => <TableAdapter.Row key={x}><TableAdapter.HeaderCell scope="row">{formatX(x)}</TableAdapter.HeaderCell>
        {series.map(item => { const value = item.data.find(point => point.x === x)?.y;
          return <TableAdapter.Cell key={item.id}>{value == null ? '—' : formatY(value)}</TableAdapter.Cell>; })}
      </TableAdapter.Row>)}</TableAdapter.Body>
    </TableAdapter>
    {xs.length === 0 && <p>{labels.empty ?? 'Нет данных'}</p>}
  </figure>;
}
