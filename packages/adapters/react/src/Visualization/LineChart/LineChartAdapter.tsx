import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { buildLineLayout } from '@dreadnought/core';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { useSeriesVisibility } from '../../shared/useSeriesVisibility.ts';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { TableAdapter } from '../../DataDisplay/Table/TableAdapter.tsx';
import { LinePlot } from './LinePlot.tsx';
import type { LineChartAdapterProps } from './lineChart.types.ts';
import { ChartPagination, useChartPage } from '../../shared/useChartPage.tsx';

export function LineChartAdapter({ label, description, series, xDomain, yDomain, width, height, xLabel = 'X', yLabel = 'Y',
  formatX = String, formatY = String, visibleSeries, defaultVisibleSeries, onVisibleSeriesChange, pageSize = 50, zoom = true, labels = {}, slotProps = {}, ...native }: LineChartAdapterProps) {
  const source = useMemo(() => buildLineLayout({ series, xDomain, yDomain, width: 1, height: 1 }), [series, xDomain[0], xDomain[1], yDomain[0], yDomain[1]]);
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
  const { visible, toggle } = useSeriesVisibility(series, visibleSeries, defaultVisibleSeries, onVisibleSeriesChange);
  const xs = useMemo(() => [...new Set(series.flatMap(item => item.data.map(point => point.x)))].sort((a, b) => a - b), [series]);
  const values = useMemo(() => new Map(series.map(item => [item.id, new Map(item.data.map(point => [point.x, point.y]))])), [series]);
  const page = useChartPage(xs, pageSize);
  const [range, setRange] = useState({ xs, start: 0, end: xs.length - 1 });
  const start = range.xs === xs ? Math.min(range.start, Math.max(0, xs.length - 2)) : 0;
  const end = range.xs === xs ? Math.max(start + 1, Math.min(range.end, xs.length - 1)) : xs.length - 1;
  const activeDomain: readonly [number, number] = zoom && xs.length > 1 && (start !== 0 || end !== xs.length - 1) ? [xs[start], xs[end]] : xDomain;
  const rangeInput = nativeProps(slotProps.rangeInput);
  return <figure {...nativeProps(native, ['role'])} aria-labelledby={`${id}-label`} aria-describedby={description !== undefined ? `${id}-description` : undefined} data-ui="line-chart">
    <figcaption id={`${id}-label`}>{label}</figcaption>
    {description !== undefined && <p id={`${id}-description`}>{description}</p>}
    <div {...nativeProps(slotProps.plotContainer)} ref={attachPlot} data-ui="line-plot-container">
      {viewport && <LinePlot {...viewport} series={series} source={source} values={values} xDomain={activeDomain} visible={visible}
        slotProps={slotProps} formatX={formatX} formatY={formatY} xLabel={xLabel} yLabel={yLabel} />}
    </div>
    {zoom && xs.length > 1 && <div {...nativeProps(slotProps.rangeControls)} data-ui="line-range-controls">
      <label>Начало: {formatX(xs[start])}<input {...rangeInput} type="range" min={0} max={xs.length - 2} value={start} aria-label="Начало диапазона"
        onChange={event => { rangeInput.onChange?.(event); if (!event.defaultPrevented) setRange({ xs, start: Math.min(Number(event.currentTarget.value), end - 1), end }); }} /></label>
      <label>Конец: {formatX(xs[end])}<input {...rangeInput} type="range" min={1} max={xs.length - 1} value={end} aria-label="Конец диапазона"
        onChange={event => { rangeInput.onChange?.(event); if (!event.defaultPrevented) setRange({ xs, start, end: Math.max(start + 1, Number(event.currentTarget.value)) }); }} /></label>
    </div>}
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
      <TableAdapter.Body>{page.rows.map(x => <TableAdapter.Row key={x}><TableAdapter.HeaderCell scope="row">{formatX(x)}</TableAdapter.HeaderCell>
        {series.map(item => { const value = values.get(item.id)?.get(x);
          return <TableAdapter.Cell key={item.id}>{value == null ? '—' : formatY(value)}</TableAdapter.Cell>; })}
      </TableAdapter.Row>)}</TableAdapter.Body>
    </TableAdapter>
    <ChartPagination {...page} slotProps={slotProps} />
    {xs.length === 0 && <p>{labels.empty ?? 'Нет данных'}</p>}
  </figure>;
}
