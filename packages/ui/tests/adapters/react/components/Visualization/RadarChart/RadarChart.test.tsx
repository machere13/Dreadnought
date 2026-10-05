import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import * as ui from '@dreadnought/ui/react';
import * as presentation from '@dreadnought/ui';
import { RadarChartAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);
const metrics = ['x', 'y', 'z'].map(id => ({ id, label: id, domain: [0, 100] as const }));
const series = [
  { id: '__proto__', label: 'A', values: { x: 80, y: 60, z: 40 } },
  { id: 'constructor', label: 'B', values: { x: 40, y: 80, z: 60 } },
];
const props = { metrics, series, label: 'Radar', width: 400, height: 320 };

it('styles all parts without leaking presentation into the unstyled adapter', () => {
  expect(ui).toHaveProperty('RadarChart');
  expect(presentation).toHaveProperty('radarChartPresentation');
  expect(presentation).not.toHaveProperty('RadarChart');
  const { container } = render(<><ui.RadarChart {...props} className="consumer" /><RadarChartAdapter {...props} label="Plain" /></>);
  const figures = container.querySelectorAll('figure');
  expect(figures[0].className).toContain('consumer');
  expect(figures[1].className).toBe('');
  for (const part of ['radar-plot', 'radar-grid', 'radar-axis', 'radar-axis-label', 'radar-series', 'radar-legend-button']) {
    expect(figures[0].querySelector(`[data-ui="${part}"]`)?.getAttribute('class')).toBeTruthy();
    expect(figures[1].querySelector(`[data-ui="${part}"]`)?.getAttribute('class')).toBeNull();
  }
  expect(screen.getByRole('table', { name: 'Radar: Данные' }).className).toBeTruthy();
});

it('covers the actual native table cells with scoped Table token styling', () => {
  const css = readFileSync('packages/ui/src/presentation/Visualization/RadarChart/RadarChart.module.css', 'utf8');
  expect(css).toMatch(/\.table :is\(th, td\)\s*\{[^}]*--dreadnought-table-active-padding-block[^}]*--dreadnought-table-border/s);
  expect(css).toMatch(/\.table thead th\s*\{[^}]*--dreadnought-table-header-bg/s);
  const { container } = render(<><ui.RadarChart {...props} /><RadarChartAdapter {...props} label="Plain" /></>);
  const tableClass = presentation.radarChartPresentation.table;
  const selector = `.${tableClass} :is(th, td)`;
  expect(container.querySelectorAll(selector)).toHaveLength(20);
  expect(container.querySelectorAll('figure')[1].querySelector(selector)).toBeNull();
});

it('keeps series presentation tied to ID through selection, reordering and disappearance', () => {
  expect(ui).toHaveProperty('RadarChart');
  const { container, rerender } = render(<ui.RadarChart {...props} />);
  const polygon = () => container.querySelector('[data-series-id="constructor"][data-ui="radar-series"]')!;
  const original = polygon().getAttribute('class');
  fireEvent.click(screen.getByRole('button', { name: 'A' }));
  expect(polygon().getAttribute('class')).toBe(original);
  expect(screen.getAllByRole('cell', { name: '80' })).toHaveLength(2);
  rerender(<ui.RadarChart {...props} series={[series[1]]} />);
  expect(polygon().getAttribute('class')).toBe(original);
  rerender(<ui.RadarChart {...props} series={[series[1], series[0]]} />);
  expect(polygon().getAttribute('class')).toBe(original);
  expect(screen.getByRole('button', { name: 'A' }).getAttribute('aria-pressed')).toBe('false');
});

it('merges consumer slots, styles and handlers while retaining controlled selection', () => {
  expect(ui).toHaveProperty('RadarChart');
  const changed = vi.fn();
  const clicked = vi.fn();
  const { container } = render(<ui.RadarChart {...props} visibleSeries={['__proto__', 'constructor']} onVisibleSeriesChange={changed}
    slotProps={{ series: () => ({ className: 'custom-series', style: { stroke: 'red' } }),
      legendButton: () => ({ className: 'custom-button', onClick: clicked }), table: { className: 'custom-table' } }} />);
  const button = screen.getByRole('button', { name: 'A' });
  fireEvent.click(button);
  expect(clicked).toHaveBeenCalledOnce();
  expect(changed).toHaveBeenCalledWith(['constructor']);
  expect(button.getAttribute('aria-pressed')).toBe('true');
  expect(button.className).toContain('custom-button');
  expect(container.querySelector('[data-ui="radar-series"]')?.getAttribute('class')).toContain('custom-series');
  expect((container.querySelector('[data-ui="radar-series"]') as SVGElement).style.stroke).toBe('red');
  expect(screen.getByRole('table').className).toContain('custom-table');
});
