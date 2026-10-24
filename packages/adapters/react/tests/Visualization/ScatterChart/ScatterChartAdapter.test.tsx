import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/Visualization/ScatterChart/index.ts';
import { createRef } from 'react';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const series = [
  { id: 'a', label: 'Alpha', data: [{ id: 'one', label: 'One', x: 2, y: 4, size: 25 }] },
  { id: 'b', label: 'Beta', data: [{ id: 'two', label: 'Two', x: 2, y: 4, size: 100 }] },
];
const props = {
  series,
  label: 'Observations',
  xDomain: [0, 10] as const,
  yDomain: [0, 10] as const,
  width: 400,
  height: 320,
};

it('keeps native circle refs, cancellation and controlled context actions', () => {
  const Chart = adapters.ScatterChartAdapter;
  const ref = createRef<SVGCircleElement>();
  const changed = vi.fn();
  function Controls() {
    const { toggle } = adapters.useScatterChart();
    return (
      <button
        onClick={() => {
          toggle('missing');
          toggle('a');
        }}
      >
        Request
      </button>
    );
  }
  const view = render(
    <Chart
      {...props}
      visibleSeries={['a', 'b']}
      onVisibleSeriesChange={changed}
      slotProps={{ point: () => ({ ref, onKeyDown: (e) => e.preventDefault() }) }}
    >
      <Controls />
      <Chart.Plot>{({ defaultContent }) => defaultContent}</Chart.Plot>
    </Chart>,
  );
  expect(ref.current?.getAttribute('data-ui')).toBe('scatter-point');
  const one = screen.getAllByRole('img')[0];
  act(() => one.focus());
  fireEvent.keyDown(one, { key: 'End' });
  expect(document.activeElement).toBe(one);
  fireEvent.click(screen.getByRole('button', { name: 'Request' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith(['b']);
  expect(screen.getAllByRole('img')).toHaveLength(2);
  view.unmount();
  expect(ref.current).toBeNull();
});

it('preserves the size column across shared pages with unsized and zero-sized observations', () => {
  const Chart = adapters.ScatterChartAdapter;
  render(
    <Chart
      {...props}
      pageSize={1}
      series={[
        {
          id: 'a',
          label: 'A',
          data: [
            { id: 'plain', label: 'Plain', x: 1, y: 2 },
            { id: 'zero', label: 'Zero', x: 3, y: 4, size: 0 },
          ],
        },
      ]}
    >
      <Chart.Table />
      <Chart.Pagination />
      <Chart.Plot />
    </Chart>,
  );
  expect(screen.getByRole('columnheader', { name: 'Размер' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.getByRole('table').textContent).toContain('Zero');
  expect(screen.getByRole('columnheader', { name: 'Размер' })).toBeTruthy();
  expect(screen.getAllByRole('img')).toHaveLength(1);
});

it('composes custom point drawing with protected circles, shared visibility and table pages', () => {
  const Chart = adapters.ScatterChartAdapter;
  function Controls() {
    const { page, visible, toggle } = adapters.useScatterChart();
    return (
      <>
        <button onClick={() => page.change(2)}>Next custom</button>
        <button onClick={() => toggle('b')}>Visible {visible.length}</button>
      </>
    );
  }
  const view = render(
    <Chart {...props} pageSize={1}>
      <Controls />
      <Chart.Legend>
        {({ series, visible }) => (
          <span>
            {series.label}: {String(visible)}
          </span>
        )}
      </Chart.Legend>
      <Chart.Plot tooltipContent={({ defaultContent }) => <div>Custom{defaultContent}</div>}>
        {({ cx, cy, radius }) => (
          <path
            d={`M${cx} ${cy - radius} L${cx + radius} ${cy} L${cx} ${cy + radius} L${cx - radius} ${cy} Z`}
            data-testid="custom-point"
          />
        )}
      </Chart.Plot>
      <Chart.Table />
      <Chart.Pagination />
      <Chart.Empty />
    </Chart>,
  );
  expect(view.container.querySelectorAll('[data-testid="custom-point"]')).toHaveLength(2);
  const [one, two] = screen.getAllByRole('img');
  expect(one.tagName.toLowerCase()).toBe('circle');
  const radius = one.getAttribute('r');
  act(() => one.focus());
  fireEvent.keyDown(one, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(two);
  expect(screen.getByRole('tooltip').textContent).toContain('Custom');
  fireEvent.keyDown(two, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(one);
  fireEvent.click(screen.getByRole('button', { name: 'Next custom' }));
  expect(screen.getByRole('spinbutton').getAttribute('value')).toBe('2');
  expect(
    screen.getByRole('table', { name: 'Observations: Все исходные данные' }).textContent,
  ).toContain('Two');
  fireEvent.click(screen.getByRole('button', { name: 'Visible 2' }));
  expect(screen.getByRole('img').getAttribute('r')).toBe(radius);
  expect(
    screen.getByRole('table', { name: 'Observations: Все исходные данные' }).textContent,
  ).toContain('Two');
});

it('keeps no default parts, supports selectively hidden tooltips and validates part scope', () => {
  const Chart = adapters.ScatterChartAdapter;
  const view = render(<Chart {...props}>{null}</Chart>);
  expect(screen.queryByRole('table')).toBeNull();
  view.rerender(
    <Chart {...props}>
      <Chart.Plot
        tooltipContent={({ point, defaultContent }) => (point.id === 'one' ? null : defaultContent)}
      />
    </Chart>,
  );
  const [one, two] = screen.getAllByRole('img');
  act(() => one.focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(one, { key: 'End' });
  expect(document.activeElement).toBe(two);
  expect(screen.getByRole('tooltip').textContent).toContain('Two');
  view.rerender(
    <Chart {...props} series={[]}>
      <Chart.Plot />
      <Chart.Empty />
    </Chart>,
  );
  expect(screen.getByText('Нет точек для отображения')).toBeTruthy();
  expect(screen.queryByRole('tooltip')).toBeNull();
  view.unmount();
  expect(() => render(<Chart.Table />)).toThrow('ScatterChart');
});

it('uses the shared hover delay and restores the focused observation after hover', () => {
  vi.useFakeTimers();
  render(<adapters.ScatterChartAdapter {...props} />);
  const [one, two] = screen.getAllByRole('img');
  fireEvent.pointerEnter(one);
  expect(screen.queryByRole('tooltip')).toBeNull();
  act(() => vi.advanceTimersByTime(100));
  expect(within(screen.getByRole('tooltip')).getByText('One')).toBeTruthy();
  fireEvent.pointerLeave(one);
  act(() => vi.advanceTimersByTime(100));
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.focus(one);
  fireEvent.pointerEnter(two);
  act(() => vi.advanceTimersByTime(100));
  expect(within(screen.getByRole('tooltip')).getByText('Two')).toBeTruthy();
  fireEvent.pointerLeave(two);
  expect(within(screen.getByRole('tooltip')).getByText('One')).toBeTruthy();
});

it('retains the hovered observation when entering its tooltip with another point focused', () => {
  render(<adapters.ScatterChartAdapter {...props} />);
  const [one, two] = screen.getAllByRole('img');
  fireEvent.focus(one);
  fireEvent.pointerEnter(two);
  const tooltip = screen.getByRole('tooltip');
  fireEvent(two, new MouseEvent('pointerout', { relatedTarget: tooltip, bubbles: true }));
  fireEvent.pointerEnter(tooltip);
  expect(within(tooltip).getByText('Two')).toBeTruthy();
  fireEvent.pointerLeave(tooltip);
  expect(within(tooltip).getByText('One')).toBeTruthy();
});

it('keeps a readable automatic height on narrow containers while honoring explicit dimensions', () => {
  let callback: ResizeObserverCallback;
  let target: Element;
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(next: ResizeObserverCallback) {
        callback = next;
      }
      observe(element: Element) {
        target = element;
      }
      disconnect() {}
    },
  );
  const { width, height, ...adaptive } = props;
  const view = render(<adapters.ScatterChartAdapter {...adaptive} />);
  act(() =>
    callback!(
      [{ target: target!, contentRect: { width: 216 } }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    ),
  );
  expect(view.container.querySelector('svg')?.getAttribute('height')).toBe('280');
  view.rerender(<adapters.ScatterChartAdapter {...props} width={216} height={200} />);
  expect(view.container.querySelector('svg')?.getAttribute('height')).toBe('200');
});

it('keeps boundary bubbles inside the SVG and does not distort their area ratio', () => {
  render(
    <adapters.ScatterChartAdapter
      {...props}
      width={280}
      height={240}
      maxBubbleRadius={200}
      series={[
        {
          id: 'a',
          label: 'A',
          data: [
            { id: 'left', label: 'Left', x: 0, y: 10, size: 25 },
            { id: 'right', label: 'Right', x: 10, y: 0, size: 100 },
          ],
        },
      ]}
    />,
  );
  const points = screen.getAllByRole('img');
  const radius = (point: HTMLElement) => Number(point.getAttribute('r'));
  expect(radius(points[1]) / radius(points[0])).toBe(2);
  for (const point of points) {
    const x = Number(point.getAttribute('cx'));
    const y = Number(point.getAttribute('cy'));
    expect(x - radius(point)).toBeGreaterThan(0);
    expect(x + radius(point)).toBeLessThan(280);
    expect(y - radius(point)).toBeGreaterThan(0);
    expect(y + radius(point)).toBeLessThan(240);
  }
});

it('paginates only the table and retains zero-size observations there', () => {
  render(
    <adapters.ScatterChartAdapter
      {...props}
      pageSize={1}
      series={[
        ...series,
        {
          id: 'c',
          label: 'Zero series',
          data: [{ id: 'zero', label: 'Zero point', x: 0, y: 0, size: 0 }],
        },
      ]}
    />,
  );
  expect(screen.getAllByRole('img')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(within(screen.getByRole('table')).getByText('Two')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(within(screen.getByRole('table')).getByText('Zero point')).toBeTruthy();
  expect(screen.getAllByRole('img')).toHaveLength(2);
});

it('shows point details, a marker, keyboard navigation and a complete data table', () => {
  expect(adapters).toHaveProperty('ScatterChartAdapter');
  render(<adapters.ScatterChartAdapter {...props} />);
  const points = screen.getAllByRole('img');
  expect(points).toHaveLength(2);
  fireEvent.focus(points[0]);
  const tooltip = screen.getByRole('tooltip');
  expect(within(tooltip).getByText('One')).toBeTruthy();
  expect(within(tooltip).getByText('25')).toBeTruthy();
  expect(tooltip.querySelector('[data-ui="mark"]')).toBeTruthy();
  fireEvent.keyDown(points[0], { key: 'ArrowRight' });
  expect(document.activeElement).toBe(points[1]);
  fireEvent.keyDown(points[1], { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(within(screen.getByRole('table')).getByText('Two')).toBeTruthy();
});

it('hides series without changing bubble size, preserves the table and handles all hidden', () => {
  render(<adapters.ScatterChartAdapter {...props} />);
  const radius = screen.getAllByRole('img')[0].getAttribute('r');
  fireEvent.click(screen.getByRole('button', { name: 'Beta' }));
  expect(screen.getAllByRole('img')).toHaveLength(1);
  expect(screen.getByRole('img').getAttribute('r')).toBe(radius);
  expect(within(screen.getByRole('table')).getByText('Two')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  expect(screen.queryAllByRole('img')).toHaveLength(0);
  expect(screen.getByText('Нет точек для отображения')).toBeTruthy();
});

it('waits for controlled visibility and permits cancellation of legend actions', () => {
  const change = vi.fn();
  const view = render(
    <adapters.ScatterChartAdapter
      {...props}
      visibleSeries={['a', 'b']}
      onVisibleSeriesChange={change}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  expect(change).toHaveBeenCalledWith(['b']);
  expect(screen.getAllByRole('img')).toHaveLength(2);
  view.rerender(
    <adapters.ScatterChartAdapter
      {...props}
      visibleSeries={['b']}
      onVisibleSeriesChange={change}
      slotProps={{ legendButton: () => ({ onClick: (e) => e.preventDefault() }) }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Beta' }));
  expect(change).toHaveBeenCalledTimes(1);
  expect(screen.getAllByRole('img')).toHaveLength(1);
});

it('clears stale tooltips and retains an accessible table before measurement', () => {
  const view = render(<adapters.ScatterChartAdapter {...props} />);
  fireEvent.focus(screen.getAllByRole('img')[0]);
  view.rerender(<adapters.ScatterChartAdapter {...props} series={[]} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  view.rerender(
    <adapters.ScatterChartAdapter
      series={series}
      label="Observations"
      xDomain={[0, 10]}
      yDomain={[0, 10]}
    />,
  );
  expect(screen.getByRole('table')).toBeTruthy();
  expect(screen.queryAllByRole('img')).toHaveLength(0);
});
