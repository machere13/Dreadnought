import { useCallback, useId, useRef, useState } from 'react';
import { buildRadarLayout, getSelectionValue } from '@dreadnought/core';
import { RadarPlot } from './RadarPlot.tsx';
import { RadarDataTable } from './RadarDataTable.tsx';
import { useRadarViewport } from './useRadarViewport.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { radarNativeProps, type RadarChartAdapterProps, type RadarChartLabels } from './radarChart.types.ts';

const defaultLabels: RadarChartLabels = {
  legend: 'Серии', dataTable: 'Данные', metric: 'Показатель', domain: 'Диапазон', direction: 'Шкала',
  increasing: 'Больше — дальше от центра', decreasing: 'Меньше — дальше от центра',
};
function validateVisibility(value: readonly string[] | undefined) {
  if (value === undefined) return;
  if (!Array.isArray(value) || Array.from(value).some(item => typeof item !== 'string')) throw new TypeError('Series visibility must be an array of strings');
  if (new Set(value).size !== value.length) throw new RangeError('Series visibility IDs must be unique');
}
export function RadarChartAdapter({ metrics, series, label, description, width, height, visibleSeries,
  defaultVisibleSeries, onVisibleSeriesChange, labels: customLabels, slotProps = {}, ...native }: RadarChartAdapterProps) {
  const layout = buildRadarLayout({ metrics, series, radius: 100 });
  if (typeof label !== 'string' || !label.trim()) throw new TypeError('Radar label must be nonempty');
  if (description !== undefined && typeof description !== 'string') throw new TypeError('Radar description must be a string');
  if (customLabels !== undefined && (!customLabels || typeof customLabels !== 'object' || Array.isArray(customLabels))) throw new TypeError('Radar labels must be an object');
  const labels = { ...defaultLabels, ...customLabels };
  if (Object.values(labels).some(value => typeof value !== 'string' || !value.trim())) throw new TypeError('Radar labels must be nonempty strings');
  if (width !== undefined || height !== undefined) {
    if (typeof width !== 'number' || typeof height !== 'number' || !Number.isFinite(width) || !Number.isFinite(height)) throw new TypeError('Radar requires finite width and height together');
    if (width <= 0 || height <= 0) throw new RangeError('Radar dimensions must be positive');
  }
  validateVisibility(visibleSeries); validateVisibility(defaultVisibleSeries);
  const id = useId();
  const [internal, setInternal] = useState<readonly string[]>(() => [...(defaultVisibleSeries ?? series.map(item => item.id))]);
  const plotRef = useRef<HTMLDivElement>(null);
  const consumerRef = slotProps.plotContainer?.ref;
  const attachPlot = useCallback((element: HTMLDivElement | null) => {
    plotRef.current = element;
    if (element) return attachRef(element, consumerRef, () => { plotRef.current = null; });
  }, [consumerRef]);
  const viewport = useRadarViewport(width, height, plotRef);
  const visible = (visibleSeries ?? internal).filter(value => series.some(item => item.id === value));
  function toggle(value: string) {
    const next = getSelectionValue(visible, { type: 'toggle', value });
    if (visibleSeries === undefined) setInternal([...next]);
    onVisibleSeriesChange?.([...next]);
  }
  return <figure {...radarNativeProps(native, ['role'])} aria-labelledby={`${id}-label`} aria-describedby={description !== undefined ? `${id}-description` : undefined} data-ui="radar-chart">
    <figcaption id={`${id}-label`}>{label}</figcaption>
    {description !== undefined && <p id={`${id}-description`}>{description}</p>}
    <div {...radarNativeProps(slotProps.plotContainer)} ref={attachPlot} data-ui="radar-plot-container">
      {viewport && <RadarPlot layout={layout} metrics={metrics} series={series} visible={visible} slotProps={slotProps} {...viewport} />}
    </div>
    <div {...radarNativeProps(slotProps.legend)} role="group" aria-label={labels.legend} data-ui="radar-legend">
      {series.map(item => {
        const buttonProps = radarNativeProps(slotProps.legendButton?.(item), ['aria-label', 'aria-labelledby', 'disabled']);
        return <button key={item.id} {...buttonProps} type="button" aria-pressed={visible.includes(item.id)} data-ui="radar-legend-button" data-series-id={item.id}
          onClick={event => { buttonProps.onClick?.(event); if (!event.defaultPrevented) toggle(item.id); }}>{item.label || item.id}</button>;
      })}
    </div>
    <RadarDataTable metrics={metrics} series={series} label={label} labels={labels} tableProps={slotProps.table} />
  </figure>;
}
