import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import * as adapters from '../../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const props = {
  label: 'Измерения',
  xDomain: [0, 10] as const,
  yDomain: [0, 100] as const,
  width: 500,
  height: 300,
  series: [
    {
      id: 'a',
      label: 'A',
      data: [
        { x: 0, y: 0 },
        { x: 5, y: null },
        { x: 10, y: 80 },
      ],
    },
    {
      id: 'b',
      label: 'B',
      data: [
        { x: 0, y: 40 },
        { x: 10, y: 100 },
      ],
    },
  ],
};
it('composes custom segments, tooltips and controls with the existing shared state', () => {
  const Chart = adapters.LineChartAdapter;
  function Controls() {
    const { visible, toggle, range, page } = adapters.useLineChart();
    return (
      <>
        <button onClick={() => toggle('a')}>Visible {visible.join(',')}</button>
        <button onClick={() => range.change(1, 2)}>Zoom custom</button>
        <button onClick={() => page.change(2)}>Page custom</button>
      </>
    );
  }
  const { container } = render(
    <Chart {...props} pageSize={1}>
      <Controls />
      <Chart.Legend>{({ series }) => <span>Series {series.label}</span>}</Chart.Legend>
      <Chart.Plot
        tooltipContent={({ defaultContent }) => <div>Custom tooltip{defaultContent}</div>}
      >
        {({ defaultContent }) => <g data-testid="custom-segment">{defaultContent}</g>}
      </Chart.Plot>
      <Chart.Table />
      <Chart.Pagination />
      <Chart.RangeControls />
      <Chart.Empty />
    </Chart>,
  );
  expect(container.querySelector('[data-testid="custom-segment"]')).toBeTruthy();
  act(() => screen.getByRole('img', { name: 'A, 0: 0' }).focus());
  fireEvent.keyDown(document.activeElement!, { key: 'End' });
  expect(document.activeElement?.getAttribute('aria-label')).toBe('B, 10: 100');
  expect(screen.getByRole('tooltip').textContent).toContain('Custom tooltip');
  fireEvent.click(screen.getByRole('button', { name: 'Visible a,b' }));
  expect(screen.queryByRole('img', { name: 'A, 0: 0' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Series A' }).getAttribute('aria-pressed')).toBe(
    'false',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Zoom custom' }));
  expect(screen.queryByRole('img', { name: 'B, 0: 40' })).toBeNull();
  expect(screen.getByRole('slider', { name: 'Начало диапазона' }).getAttribute('value')).toBe('1');
  fireEvent.click(screen.getByRole('button', { name: 'Page custom' }));
  expect(screen.getByRole('spinbutton').getAttribute('value')).toBe('2');
  expect(screen.getByRole('table', { name: 'Измерения: Данные' }).textContent).toContain('5');
});

it('remounts an adaptive composed plot and supports no tooltip or no default parts', () => {
  const Chart = adapters.LineChartAdapter;
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
  const { width, height, ...adaptive } = props;
  const { rerender } = render(<Chart {...adaptive}>{null}</Chart>);
  expect(screen.queryByRole('table')).toBeNull();
  rerender(
    <Chart {...adaptive}>
      <Chart.Plot tooltipContent={() => null} />
    </Chart>,
  );
  act(() =>
    callback!(
      [{ target: target!, contentRect: { width: 500 } }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    ),
  );
  act(() => screen.getByRole('img', { name: 'A, 0: 0' }).focus());
  fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
  expect(document.activeElement?.getAttribute('aria-label')).toBe('A, 10: 80');
  expect(screen.queryByRole('tooltip')).toBeNull();
  rerender(<Chart {...adaptive}>{null}</Chart>);
  expect(disconnect).toHaveBeenCalled();
  expect(() => render(<Chart.Legend />)).toThrow('LineChart');
});
it('renders accessible points, separate gap segments and original data', () => {
  expect(adapters).toHaveProperty('LineChartAdapter');
  const { container } = render(<adapters.LineChartAdapter {...props} />);
  expect(container.querySelectorAll('[data-ui="line-series"]')).toHaveLength(3);
  expect(screen.getByRole('img', { name: 'A, 0: 0' })).toBeTruthy();
  expect(screen.getByRole('table', { name: 'Измерения: Данные' }).textContent).toContain('—');
});

it('opens a custom tooltip after a point without content and preserves controlled visibility', () => {
  const Chart = adapters.LineChartAdapter;
  const changed = vi.fn();
  function Controls() {
    const { toggle, range, page } = adapters.useLineChart();
    return (
      <button
        onClick={() => {
          toggle('missing');
          range.change(-1, 99);
          page.change(999);
          toggle('a');
        }}
      >
        Request
      </button>
    );
  }
  render(
    <Chart {...props} visibleSeries={['a', 'b']} onVisibleSeriesChange={changed}>
      <Controls />
      <Chart.Plot
        tooltipContent={({ point, defaultContent }) =>
          point.value.x === 0 ? null : defaultContent
        }
      />
      <Chart.RangeControls />
    </Chart>,
  );
  act(() => screen.getByRole('img', { name: 'A, 0: 0' }).focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
  expect(screen.getByRole('tooltip').textContent).toContain('80');
  fireEvent.click(screen.getByRole('button', { name: 'Request' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith(['b']);
  expect(screen.getByRole('img', { name: 'A, 0: 0' })).toBeTruthy();
  expect(screen.getByRole('slider', { name: 'Начало диапазона' }).getAttribute('value')).toBe('0');
});
it('shows aligned tooltip rows and closes them when the active series disappears', () => {
  const { rerender } = render(<adapters.LineChartAdapter {...props} />);
  fireEvent.focus(screen.getByRole('img', { name: 'A, 0: 0' }));
  const tooltip = screen.getByRole('tooltip');
  expect(within(tooltip).getByRole('row', { name: 'A 0' })).toBeTruthy();
  expect(within(tooltip).getByRole('row', { name: 'B 40' })).toBeTruthy();
  expect(tooltip.querySelectorAll('[data-ui="mark"]')).toHaveLength(2);
  rerender(<adapters.LineChartAdapter {...props} visibleSeries={['b']} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
});
it('navigates points with existing keyboard rules', () => {
  render(<adapters.LineChartAdapter {...props} />);
  const start = screen.getByRole('img', { name: 'A, 0: 0' });
  act(() => start.focus());
  fireEvent.keyDown(start, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'A, 10: 80' }));
  expect(within(screen.getByRole('tooltip')).getByRole('row', { name: 'A 80' })).toBeTruthy();
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});
it('keeps keyboard boundaries, Home/End and IME behavior for point navigation', () => {
  render(<adapters.LineChartAdapter {...props} />);
  const first = screen.getByRole('img', { name: 'A, 0: 0' });
  const last = screen.getByRole('img', { name: 'B, 10: 100' });
  act(() => first.focus());
  fireEvent.keyDown(first, { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(first);
  fireEvent.keyDown(first, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(first);
  fireEvent.keyDown(first, { key: 'ArrowRight', isComposing: true });
  expect(document.activeElement).toBe(first);
  fireEvent.keyDown(first, { key: 'End' });
  expect(document.activeElement).toBe(last);
  fireEvent.keyDown(last, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(last);
  fireEvent.keyDown(last, { key: 'Home' });
  expect(document.activeElement).toBe(first);
});

it('uses nearest-point search between vertices, not only circle hover', () => {
  vi.useFakeTimers();
  render(<adapters.LineChartAdapter {...props} />);
  const plot = document.querySelector<SVGSVGElement>('[data-ui="line-plot"]')!;
  vi.spyOn(plot, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 500,
    height: 300,
  } as DOMRect);
  fireEvent(plot, new MouseEvent('pointermove', { clientX: 50, clientY: 265, bubbles: true }));
  expect(screen.queryByRole('tooltip')).toBeNull();
  act(() => vi.advanceTimersByTime(100));
  expect(within(screen.getByRole('tooltip')).getByRole('row', { name: 'A 0' })).toBeTruthy();
});
it('forwards point refs and allows consumers to cancel keyboard navigation', () => {
  const ref = createRef<SVGCircleElement>();
  const { unmount } = render(
    <adapters.LineChartAdapter
      {...props}
      slotProps={{ point: () => ({ ref, onKeyDown: (event) => event.preventDefault() }) }}
    />,
  );
  expect(ref.current).toBeTruthy();
  const point = screen.getByRole('img', { name: 'A, 0: 0' });
  point.focus();
  fireEvent.keyDown(point, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(point);
  unmount();
  expect(ref.current).toBeNull();
});
it('keeps SSR data accessible and observes the container with cleanup', () => {
  const { width, height, ...adaptive } = props;
  const server = document.createElement('div');
  server.innerHTML = renderToString(<adapters.LineChartAdapter {...adaptive} />);
  expect(server.querySelector('caption')?.textContent).toBe('Измерения: Данные');
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
  const { container, unmount } = render(<adapters.LineChartAdapter {...adaptive} />);
  expect(container.querySelector('svg')).toBeNull();
  act(() =>
    callback!(
      [{ target: target!, contentRect: { width: 500 } }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    ),
  );
  expect(container.querySelector('svg')?.getAttribute('width')).toBe('500');
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
it('waits for controlled visibility and retains full data while hiding lines', () => {
  const changed = vi.fn();
  const { container } = render(
    <adapters.LineChartAdapter
      {...props}
      visibleSeries={['a', 'b']}
      onVisibleSeriesChange={changed}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'A' }));
  expect(changed).toHaveBeenCalledWith(['b']);
  expect(container.querySelectorAll('[data-ui="line-series"]')).toHaveLength(3);
  expect(screen.getByRole('table').textContent).toContain('80');
});
it('retains the hovered point while reading its tooltip with another point focused', () => {
  render(<adapters.LineChartAdapter {...props} />);
  fireEvent.focus(screen.getByRole('img', { name: 'A, 0: 0' }));
  fireEvent.pointerEnter(screen.getByRole('img', { name: 'A, 10: 80' }));
  const tooltip = screen.getByRole('tooltip');
  fireEvent(
    document.querySelector('[data-ui="line-plot"]')!,
    new MouseEvent('pointerout', { relatedTarget: tooltip, bubbles: true }),
  );
  fireEvent.pointerEnter(tooltip);
  expect(within(tooltip).getByRole('row', { name: 'A 80' })).toBeTruthy();
  fireEvent.pointerLeave(tooltip);
  expect(within(screen.getByRole('tooltip')).getByRole('row', { name: 'A 0' })).toBeTruthy();
});
