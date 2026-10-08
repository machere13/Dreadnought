import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { RadarChartAdapter } from '../../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const metrics = ['a', 'b', 'c', 'd'].map((id) => ({ id, label: id, domain: [0, 100] as const }));
const series = [
  { id: 'A', label: 'Вариант A', values: { a: 100, b: 50, c: 0, d: 25 } },
  { id: 'B', label: 'Вариант B', values: { a: 50, b: 50, c: 50, d: 50 } },
];
const props = { label: 'Сравнение', metrics, series, width: 400, height: 320 };

it('renders C1 coordinates, semantic data and native legend', () => {
  const { container } = render(
    <RadarChartAdapter
      label="Сравнение"
      metrics={metrics}
      series={series}
      width={400}
      height={320}
    />,
  );
  const svg = container.querySelector('svg')!;
  expect(svg.getAttribute('viewBox')).toBe('-140 -140 280 280');
  expect(svg.getAttribute('aria-hidden')).toBeNull();
  expect(svg.getAttribute('width')).toBe('400');
  const points = container
    .querySelector('polygon[data-series-id="A"]')!
    .getAttribute('points')!
    .split(/\s+/)
    .map((pair) => pair.split(',').map(Number));
  expect(points[0][1]).toBeCloseTo(-100);
  expect(points[1][0]).toBeCloseTo(50);
  expect(points[3][0]).toBeCloseTo(-25);
  expect(screen.getByRole('button', { name: 'Вариант A' }).getAttribute('type')).toBe('button');
  expect(screen.getByRole('table', { name: 'Сравнение: Данные' })).toBeTruthy();
  expect(container.querySelectorAll('th[scope="row"]')).toHaveLength(4);
});

it('waits for controlled props and isolates a mutating callback', () => {
  const visible = Object.freeze(['A', 'B']);
  const changed = vi.fn((next: string[]) => {
    expect(next).toEqual(['B']);
    next.length = 0;
  });
  const { container, rerender } = render(
    <RadarChartAdapter {...props} visibleSeries={visible} onVisibleSeriesChange={changed} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Вариант A' }));
  expect(changed).toHaveBeenCalledTimes(1);
  expect(visible).toEqual(['A', 'B']);
  expect(container.querySelectorAll('polygon[data-series-id]')).toHaveLength(2);
  rerender(<RadarChartAdapter {...props} visibleSeries={['B']} />);
  expect(container.querySelectorAll('polygon[data-series-id]')).toHaveLength(1);
});

it('supports native keyboard selection without leaking internal arrays', async () => {
  const user = userEvent.setup();
  const { container } = render(
    <RadarChartAdapter {...props} onVisibleSeriesChange={(next) => next.push('A')} />,
  );
  screen.getByRole('button', { name: 'Вариант A' }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'Вариант A' }).getAttribute('aria-pressed')).toBe(
    'false',
  );
  await user.tab();
  await user.keyboard(' ');
  expect(container.querySelectorAll('polygon[data-series-id]')).toHaveLength(0);
  expect(screen.getAllByRole('row')).toHaveLength(5);
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Вариант A' }));
});

it('offers every visible vertex through focus and shows its original value', () => {
  const { container } = render(<RadarChartAdapter {...props} />);
  expect(container.querySelectorAll('[data-ui="radar-point"]')).toHaveLength(8);
  const point = screen.getByRole('img', { name: 'Вариант A, c: 0' });
  fireEvent.focus(point);
  expect(
    within(screen.getByRole('tooltip')).getByRole('table', { name: 'c' }).textContent,
  ).toContain('Вариант A0');
  expect(point.getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id);
  fireEvent.keyDown(point, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});
it('shows a caption and aligned marker, series name and raw value for visible series', () => {
  const { rerender } = render(<RadarChartAdapter {...props} />);
  fireEvent.focus(screen.getByRole('img', { name: 'Вариант A, c: 0' }));
  const table = within(screen.getByRole('tooltip')).getByRole('table', { name: 'c' });
  expect(within(table).getByRole('row', { name: 'Вариант A 0' })).toBeTruthy();
  expect(within(table).getByRole('row', { name: 'Вариант B 50' })).toBeTruthy();
  expect(table.querySelectorAll('[data-ui="mark"][data-shape="circle"]')).toHaveLength(2);
  rerender(<RadarChartAdapter {...props} visibleSeries={['A']} />);
  expect(
    within(screen.getByRole('tooltip')).queryByRole('row', { name: 'Вариант B 50' }),
  ).toBeNull();
});

it('moves tooltip content between vertices and removes it when the active series disappears', () => {
  vi.useFakeTimers();
  const { rerender } = render(<RadarChartAdapter {...props} />);
  fireEvent.pointerEnter(screen.getByRole('img', { name: 'Вариант A, b: 50' }));
  expect(screen.queryByRole('tooltip')).toBeNull();
  act(() => vi.advanceTimersByTime(100));
  expect(within(screen.getByRole('tooltip')).getByRole('table', { name: 'b' })).toBeTruthy();
  fireEvent.pointerEnter(screen.getByRole('img', { name: 'Вариант B, a: 50' }));
  expect(within(screen.getByRole('tooltip')).getByRole('table', { name: 'a' })).toBeTruthy();
  rerender(<RadarChartAdapter {...props} visibleSeries={['A']} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(screen.getByRole('table').textContent).toContain('Вариант B');
});
it('restores the focused vertex after hovering a different vertex', () => {
  render(<RadarChartAdapter {...props} />);
  const focused = screen.getByRole('img', { name: 'Вариант A, b: 50' });
  const hovered = screen.getByRole('img', { name: 'Вариант B, a: 50' });
  fireEvent.focus(focused);
  fireEvent.pointerEnter(hovered);
  fireEvent.pointerLeave(hovered);
  expect(within(screen.getByRole('tooltip')).getByRole('table', { name: 'b' })).toBeTruthy();
  expect(focused.getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id);
});
it('does not retain focus when the focused series is removed', () => {
  vi.useFakeTimers();
  const { rerender } = render(<RadarChartAdapter {...props} />);
  fireEvent.focus(screen.getByRole('img', { name: 'Вариант A, b: 50' }));
  const hovered = screen.getByRole('img', { name: 'Вариант B, a: 50' });
  fireEvent.pointerEnter(hovered);
  rerender(<RadarChartAdapter {...props} visibleSeries={['B']} />);
  fireEvent.pointerLeave(hovered);
  act(() => vi.advanceTimersByTime(100));
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('honors cancelled clicks and forwards native props, refs and original slot inputs', () => {
  const root = createRef<HTMLElement>();
  const plot = createRef<SVGSVGElement>();
  const changed = vi.fn();
  const axis = vi.fn((_metric: (typeof metrics)[number]) => ({ className: 'axis' }));
  const polygon = vi.fn((_series: (typeof series)[number]) => ({ className: 'series' }));
  render(
    <RadarChartAdapter
      {...props}
      ref={root}
      className="root"
      style={{ margin: 0 }}
      description="Описание"
      onVisibleSeriesChange={changed}
      slotProps={{
        plot: { ref: plot, className: 'plot' },
        axis,
        series: polygon,
        legendButton: () => ({ onClick: (event) => event.preventDefault() }),
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Вариант A' }));
  expect(changed).not.toHaveBeenCalled();
  expect(root.current?.className).toBe('root');
  expect(plot.current?.getAttribute('class')).toBe('plot');
  expect(axis.mock.calls[0][0]).toBe(metrics[0]);
  expect(polygon.mock.calls[0][0]).toBe(series[0]);
  expect(root.current?.getAttribute('aria-describedby')).toBe(screen.getByText('Описание').id);
});

it('keeps exact IDs across disappearance, ignores new series and reads defaults once', () => {
  const changed = vi.fn();
  const { rerender } = render(
    <RadarChartAdapter
      {...props}
      defaultVisibleSeries={['A', 'unknown']}
      onVisibleSeriesChange={changed}
    />,
  );
  rerender(
    <RadarChartAdapter
      {...props}
      series={[series[1]]}
      defaultVisibleSeries={['B']}
      onVisibleSeriesChange={changed}
    />,
  );
  expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false');
  rerender(
    <RadarChartAdapter
      {...props}
      series={[...series, { ...series[0], id: 'C', label: 'C' }]}
      onVisibleSeriesChange={changed}
    />,
  );
  expect(screen.getByRole('button', { name: 'Вариант A' }).getAttribute('aria-pressed')).toBe(
    'true',
  );
  expect(screen.getByRole('button', { name: 'C' }).getAttribute('aria-pressed')).toBe('false');
  rerender(<RadarChartAdapter {...props} series={[series[1]]} onVisibleSeriesChange={changed} />);
  fireEvent.click(screen.getByRole('button'));
  expect(changed).toHaveBeenCalledWith(['B']);
  rerender(<RadarChartAdapter {...props} onVisibleSeriesChange={changed} />);
  expect(screen.getByRole('button', { name: 'Вариант A' }).getAttribute('aria-pressed')).toBe(
    'false',
  );
});

it('handles prototype-like IDs, empty labels, reverse, long text and multiple instances', () => {
  const data = Object.freeze(
    series.map((item, index) =>
      Object.freeze({
        ...item,
        id: index ? 'constructor' : '__proto__',
        label: '',
        values: Object.freeze({ ...item.values }),
      }),
    ),
  );
  const axes = Object.freeze(
    metrics.map((item, index) =>
      Object.freeze({ ...item, label: index ? '' : 'x'.repeat(220), reverse: index === 0 }),
    ),
  );
  const changed = vi.fn();
  const { container } = render(
    <>
      <RadarChartAdapter {...props} metrics={axes} series={data} onVisibleSeriesChange={changed} />
      <RadarChartAdapter {...props} series={[]} />
    </>,
  );
  fireEvent.click(screen.getByRole('button', { name: '__proto__' }));
  expect(changed).toHaveBeenCalledWith(['constructor']);
  expect(screen.getAllByRole('table')).toHaveLength(2);
  expect(screen.getAllByText('x'.repeat(220))).toHaveLength(2);
  expect(screen.getByText('Меньше — дальше от центра')).toBeTruthy();
  const figures = [...container.querySelectorAll('figure')];
  expect(new Set(figures.map((item) => item.getAttribute('aria-labelledby'))).size).toBe(2);
  const reversed = container
    .querySelector('polygon[data-series-id="constructor"]')!
    .getAttribute('points')!
    .split(' ')[0]
    .split(',')
    .map(Number);
  expect(reversed[1]).toBeCloseTo(-50);
});

it('protects geometry, children and semantics from JavaScript slot overrides', () => {
  const { container } = render(
    <RadarChartAdapter
      {...props}
      {...({ 'aria-labelledby': 'bad' } as any)}
      slotProps={
        {
          plot: {
            viewBox: 'bad',
            tabIndex: 0,
            children: 'bad',
            dangerouslySetInnerHTML: { __html: 'bad' },
          },
          series: () => ({ points: 'bad', children: 'bad' }),
          legendButton: () => ({
            type: 'submit',
            'aria-pressed': false,
            'aria-label': 'bad',
            'aria-labelledby': 'bad',
            disabled: true,
            children: 'bad',
          }),
          table: { 'aria-hidden': true, hidden: true, role: 'presentation', children: 'bad' },
        } as any
      }
    />,
  );
  const svg = container.querySelector('svg')!;
  expect(svg.getAttribute('viewBox')).toBe('-140 -140 280 280');
  expect(svg.hasAttribute('tabindex')).toBe(false);
  expect(container.querySelector('polygon[data-series-id]')?.getAttribute('points')).not.toBe(
    'bad',
  );
  const button = screen.getByRole('button', { name: 'Вариант A' });
  expect(button.getAttribute('type')).toBe('button');
  expect(button.getAttribute('aria-pressed')).toBe('true');
  expect(button.hasAttribute('disabled')).toBe(false);
  const table = screen.getByRole('table', { name: 'Сравнение: Данные' });
  expect(table.hasAttribute('hidden')).toBe(false);
  expect(table.hasAttribute('aria-hidden')).toBe(false);
  expect(container.querySelector('figure')?.getAttribute('aria-labelledby')).not.toBe('bad');
});

it.each([
  [{ width: undefined }, TypeError],
  [{ height: undefined }, TypeError],
  [{ width: '400' }, TypeError],
  [{ width: NaN }, TypeError],
  [{ height: Infinity }, TypeError],
  [{ width: 0 }, RangeError],
  [{ width: -1 }, RangeError],
  [{ height: 0 }, RangeError],
  [{ label: '' }, TypeError],
  [{ label: ' ' }, TypeError],
  [{ label: 1 }, TypeError],
  [{ description: 1 }, TypeError],
  [{ labels: { legend: '' } }, TypeError],
  [{ labels: { metric: 3 } }, TypeError],
  [{ labels: 3 }, TypeError],
  [{ visibleSeries: {} }, TypeError],
  [{ visibleSeries: 'A' }, TypeError],
  [{ visibleSeries: Array(1) }, TypeError],
  [{ visibleSeries: ['A', 'A'] }, RangeError],
  [{ defaultVisibleSeries: ['B', 'B'] }, RangeError],
])('rejects invalid props %j', (invalid, error) => {
  expect(() => render(<RadarChartAdapter {...props} {...(invalid as any)} />)).toThrow(error);
});

it('does not mask invalid values in hidden series', () => {
  expect(() =>
    render(
      <RadarChartAdapter
        {...props}
        visibleSeries={[]}
        series={[{ ...series[0], values: { ...series[0].values, a: NaN } }]}
      />,
    ),
  ).toThrow(TypeError);
});
