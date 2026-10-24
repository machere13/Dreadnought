import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/Visualization/PieChart/index.ts';
import { createRef } from 'react';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const data = [
  { id: 'a', label: 'Alpha', value: 30 },
  { id: 'b', label: 'Beta', value: 70 },
  { id: 'zero', label: 'Zero', value: 0 },
];
const props = { data, label: 'Budget', width: 400, height: 320 };

it('keeps native refs and controlled visibility when drawing is replaced', () => {
  const Chart = adapters.PieChartAdapter;
  const ref = createRef<SVGPathElement>();
  const changed = vi.fn();
  function Controls() {
    const { toggle } = adapters.usePieChart();
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
      visibleItems={['a', 'b']}
      onVisibleItemsChange={changed}
      slotProps={{ slice: () => ({ ref, onKeyDown: (e) => e.preventDefault() }) }}
    >
      <Controls />
      <Chart.Plot>{({ defaultContent }) => defaultContent}</Chart.Plot>
    </Chart>,
  );
  expect(ref.current?.getAttribute('data-ui')).toBe('pie-slice');
  const alpha = screen.getByRole('img', { name: 'Alpha: 30 (30%)' });
  act(() => alpha.focus());
  fireEvent.keyDown(alpha, { key: 'End' });
  expect(document.activeElement).toBe(alpha);
  fireEvent.click(screen.getByRole('button', { name: 'Request' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith(['b']);
  expect(screen.getAllByRole('img')).toHaveLength(2);
  view.unmount();
  expect(ref.current).toBeNull();
});

it('measures a conditionally mounted plot and releases its observer', () => {
  const Chart = adapters.PieChartAdapter;
  let callback: ResizeObserverCallback;
  let target: Element;
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(next: ResizeObserverCallback) {
        callback = next;
      }
      observe(element: Element) {
        target = element;
      }
      disconnect = disconnect;
    },
  );
  const view = render(
    <Chart data={data} label="Adaptive">
      {null}
    </Chart>,
  );
  view.rerender(
    <Chart data={data} label="Adaptive">
      <Chart.Plot />
    </Chart>,
  );
  act(() =>
    callback!(
      [{ target: target!, contentRect: { width: 300 } }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    ),
  );
  expect(view.container.querySelector('svg')?.getAttribute('width')).toBe('300');
  view.rerender(
    <Chart data={data} label="Adaptive">
      {null}
    </Chart>,
  );
  expect(disconnect).toHaveBeenCalledOnce();
});

it('composes slice drawing, tooltip and legend around the existing path behavior', () => {
  const Chart = adapters.PieChartAdapter;
  function Summary() {
    const { layout, toggle } = adapters.usePieChart();
    return <button onClick={() => toggle('a')}>Total {layout.total}</button>;
  }
  const view = render(
    <Chart {...props} innerRadius={0.6}>
      <Summary />
      <Chart.Legend>
        {({ item, visible }) => (
          <span>
            {item.label}: {String(visible)}
          </span>
        )}
      </Chart.Legend>
      <Chart.Plot tooltipContent={({ defaultContent }) => <div>Custom{defaultContent}</div>}>
        {({ path }) => <path d={path} data-testid="custom-slice" />}
      </Chart.Plot>
      <Chart.Table />
    </Chart>,
  );
  expect(view.container.querySelectorAll('[data-testid="custom-slice"]')).toHaveLength(2);
  const alpha = screen.getByRole('img', { name: 'Alpha: 30 (30%)' });
  expect(alpha.tagName.toLowerCase()).toBe('path');
  act(() => alpha.focus());
  fireEvent.keyDown(alpha, { key: 'ArrowRight' });
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Beta: 70 (70%)');
  expect(screen.getByRole('tooltip').textContent).toContain('Custom');
  fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(alpha);
  fireEvent.click(screen.getByRole('button', { name: 'Total 100' }));
  expect(screen.getByRole('img', { name: 'Beta: 70 (100%)' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Alpha: false' }).getAttribute('aria-pressed')).toBe(
    'false',
  );
  expect(screen.getByRole('table', { name: 'Budget — Все исходные данные' }).textContent).toContain(
    'Alpha',
  );
});

it('supports explicit empty composition and selectively missing custom tooltips', () => {
  const Chart = adapters.PieChartAdapter;
  const view = render(<Chart {...props}>{null}</Chart>);
  expect(screen.queryByRole('table')).toBeNull();
  view.rerender(
    <Chart {...props}>
      <Chart.Plot
        tooltipContent={({ slice, defaultContent }) => (slice.id === 'a' ? null : defaultContent)}
      />
    </Chart>,
  );
  act(() => screen.getByRole('img', { name: 'Alpha: 30 (30%)' }).focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(document.activeElement!, { key: 'End' });
  expect(screen.getByRole('tooltip').textContent).toContain('Beta');
  view.rerender(
    <Chart {...props} data={[]}>
      <Chart.Plot />
    </Chart>,
  );
  expect(screen.getByRole('status').textContent).toContain('Нет положительных');
  expect(screen.queryByRole('tooltip')).toBeNull();
  view.unmount();
  expect(() => render(<Chart.Legend />)).toThrow('PieChart');
});

it('exposes a keyboard-accessible pie, tooltip and complete data table', () => {
  expect(adapters).toHaveProperty('PieChartAdapter');
  render(<adapters.PieChartAdapter {...props} />);
  const alpha = screen.getByRole('img', { name: 'Alpha: 30 (30%)' });
  fireEvent.focus(alpha);
  const tooltip = screen.getByRole('tooltip');
  expect(within(tooltip).getByText('Alpha')).toBeTruthy();
  expect(within(tooltip).getByText('30%')).toBeTruthy();
  expect(tooltip.querySelector('[data-ui="mark"]')).toBeTruthy();
  fireEvent.keyDown(alpha, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'Beta: 70 (70%)' }));
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(within(screen.getByRole('table')).getByText('Zero')).toBeTruthy();
});

it('recalculates visible shares, keeps the table, and handles all-hidden data', () => {
  render(<adapters.PieChartAdapter {...props} innerRadius={0.6} />);
  fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  const beta = screen.getByRole('img', { name: 'Beta: 70 (100%)' });
  expect(beta.getAttribute('d')?.match(/A /g)).toHaveLength(4);
  expect(within(screen.getByRole('table')).getByText('Alpha')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Beta' }));
  expect(screen.queryAllByRole('img')).toHaveLength(0);
  expect(screen.getByText('Нет положительных значений для отображения')).toBeTruthy();
});

it('waits for controlled visibility and supports canceling legend actions', () => {
  const onChange = vi.fn();
  const view = render(
    <adapters.PieChartAdapter
      {...props}
      visibleItems={['a', 'b']}
      onVisibleItemsChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  expect(onChange).toHaveBeenCalledWith(['b']);
  expect(screen.getAllByRole('img')).toHaveLength(2);
  view.rerender(
    <adapters.PieChartAdapter
      {...props}
      visibleItems={['b']}
      slotProps={{ legendButton: () => ({ onClick: (event) => event.preventDefault() }) }}
      onVisibleItemsChange={onChange}
    />,
  );
  expect(screen.getAllByRole('img')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Beta' }));
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('closes stale tooltips when data disappears and renders empty data', () => {
  const view = render(<adapters.PieChartAdapter {...props} />);
  fireEvent.focus(screen.getByRole('img', { name: 'Alpha: 30 (30%)' }));
  expect(screen.getByRole('tooltip')).toBeTruthy();
  view.rerender(<adapters.PieChartAdapter {...props} data={[]} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(screen.getByText('Нет положительных значений для отображения')).toBeTruthy();
});

it('shows hover details after the shared delay and restores the focused slice', () => {
  vi.useFakeTimers();
  render(<adapters.PieChartAdapter {...props} />);
  const alpha = screen.getByRole('img', { name: 'Alpha: 30 (30%)' });
  const beta = screen.getByRole('img', { name: 'Beta: 70 (70%)' });
  fireEvent.pointerEnter(alpha);
  expect(screen.queryByRole('tooltip')).toBeNull();
  act(() => vi.advanceTimersByTime(100));
  expect(within(screen.getByRole('tooltip')).getByText('Alpha')).toBeTruthy();
  fireEvent.pointerLeave(alpha);
  act(() => vi.advanceTimersByTime(100));
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.focus(alpha);
  fireEvent.pointerEnter(beta);
  act(() => vi.advanceTimersByTime(100));
  expect(within(screen.getByRole('tooltip')).getByText('Beta')).toBeTruthy();
  fireEvent.pointerLeave(beta);
  expect(within(screen.getByRole('tooltip')).getByText('Alpha')).toBeTruthy();
});

it('draws a full disk with two arcs and isolates state from callback mutation', () => {
  render(
    <adapters.PieChartAdapter
      {...props}
      onVisibleItemsChange={(next) => {
        next.length = 0;
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  expect(
    screen.getByRole('img', { name: 'Beta: 70 (100%)' }).getAttribute('d')?.match(/A /g),
  ).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  expect(screen.getAllByRole('img')).toHaveLength(2);
});

it('preserves accessible fallback without measurements and validates hidden data', () => {
  const view = render(<adapters.PieChartAdapter data={data} label="Budget" />);
  expect(screen.queryAllByRole('img')).toHaveLength(0);
  expect(screen.getAllByRole('button')).toHaveLength(3);
  expect(screen.getByRole('table')).toBeTruthy();
  view.unmount();
  expect(() =>
    render(
      <adapters.PieChartAdapter
        {...props}
        visibleItems={['b']}
        data={[{ ...data[0], value: -1 }, data[1]]}
      />,
    ),
  ).toThrow(RangeError);
});
