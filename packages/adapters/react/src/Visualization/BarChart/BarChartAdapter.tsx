import { useCallback, useId, useRef, useState } from 'react';
import { buildBarLayout, getSelectionValue } from '@dreadnought/core';
import { useChartViewport } from '../../shared/useChartViewport.ts';
import { chartNativeProps as nativeProps } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { TableAdapter } from '../../DataDisplay/Table/index.ts';
import { BarPlot } from './BarPlot.tsx';
import type { BarChartAdapterProps } from './barChart.types.ts';

export function BarChartAdapter({ label, description, categories, series, domain, orientation, gapRatio, width, height, categoryLabel = 'Категория', valueLabel = 'Значение',
  formatValue = String, visibleSeries, defaultVisibleSeries, onVisibleSeriesChange, labels = {}, slotProps = {}, ...native }: BarChartAdapterProps) {
  buildBarLayout({ categories, series, domain, orientation, gapRatio, width: 1, height: 1 });
  if ([label, categoryLabel, valueLabel, ...Object.values(labels)].some(value => typeof value !== 'string' || !value.trim())) throw new TypeError('Bar labels must be nonempty strings');
  if (description !== undefined && typeof description !== 'string') throw new TypeError('Bar description must be a string');
  if (typeof formatValue !== 'function') throw new TypeError('Bar formatters must be functions');
  if (width !== undefined || height !== undefined) {
    if (!Number.isFinite(width) || !Number.isFinite(height)) throw new TypeError('Bar requires finite dimensions together');
    if (width! <= 0 || height! <= 0) throw new RangeError('Bar dimensions must be positive');
  }
  for (const value of [visibleSeries, defaultVisibleSeries]) if (value !== undefined) {
    if (!Array.isArray(value) || value.some(id => typeof id !== 'string')) throw new TypeError('Bar visibility must be an array of strings');
    if (new Set(value).size !== value.length) throw new RangeError('Bar visibility must contain unique IDs');
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
  function toggle(value: string) {
    const next = getSelectionValue(visible, { type: 'toggle', value });
    if (visibleSeries === undefined) setInternal([...next]);
    onVisibleSeriesChange?.([...next]);
  }
  return <figure {...nativeProps(native, ['role'])} aria-labelledby={`${id}-label`} aria-describedby={description !== undefined ? `${id}-description` : undefined} data-ui="bar-chart">
    <figcaption id={`${id}-label`}>{label}</figcaption>
    {description !== undefined && <p id={`${id}-description`}>{description}</p>}
    <div {...nativeProps(slotProps.plotContainer)} ref={attachPlot} data-ui="bar-plot-container">
      {viewport && <BarPlot {...viewport} categories={categories} series={series} domain={domain} orientation={orientation} gapRatio={gapRatio} visible={visible}
        slotProps={slotProps} formatValue={formatValue} categoryLabel={categoryLabel} valueLabel={valueLabel} />}
    </div>
    <div {...nativeProps(slotProps.legend)} role="group" aria-label={labels.legend ?? 'Серии'} data-ui="bar-legend">
      {series.map(item => {
        const slot = nativeProps(slotProps.legendButton?.(item), ['aria-label', 'aria-labelledby', 'disabled']);
        return <button {...slot} key={item.id} type="button" aria-pressed={visible.includes(item.id)} data-ui="bar-legend-button" data-series-id={item.id}
          onClick={event => { slot.onClick?.(event); if (!event.defaultPrevented) toggle(item.id); }}>{item.label || item.id}</button>;
      })}
    </div>
    <TableAdapter {...nativeProps(slotProps.table, ['role', 'aria-hidden', 'hidden'])}>
      <caption>{label}: {labels.dataTable ?? 'Данные'}</caption>
      <TableAdapter.Head><TableAdapter.Row><TableAdapter.HeaderCell scope="col">{categoryLabel}</TableAdapter.HeaderCell>
        {series.map(item => <TableAdapter.HeaderCell key={item.id} scope="col">{item.label || item.id} ({valueLabel})</TableAdapter.HeaderCell>)}
      </TableAdapter.Row></TableAdapter.Head>
      <TableAdapter.Body>{categories.map(category => <TableAdapter.Row key={category.id}><TableAdapter.HeaderCell scope="row">{category.label || category.id}</TableAdapter.HeaderCell>
        {series.map(item => { const value = Object.hasOwn(item.values, category.id) ? item.values[category.id] : null;
          return <TableAdapter.Cell key={item.id}>{value == null ? '—' : formatValue(value)}</TableAdapter.Cell>; })}
      </TableAdapter.Row>)}</TableAdapter.Body>
    </TableAdapter>
    {categories.length === 0 && <p>{labels.empty ?? 'Нет данных'}</p>}
  </figure>;
}
