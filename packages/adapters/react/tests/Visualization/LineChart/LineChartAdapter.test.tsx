import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import * as adapters from '../../../src/unstyled.ts';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const props = { label: 'Измерения', xDomain: [0, 10] as const, yDomain: [0, 100] as const, width: 500, height: 300,
  series: [{ id: 'a', label: 'A', data: [{ x: 0, y: 0 }, { x: 5, y: null }, { x: 10, y: 80 }] },
    { id: 'b', label: 'B', data: [{ x: 0, y: 40 }, { x: 10, y: 100 }] }] };
it('renders accessible points, separate gap segments and original data', () => {
  expect(adapters).toHaveProperty('LineChartAdapter');
  const { container } = render(<adapters.LineChartAdapter {...props} />);
  expect(container.querySelectorAll('[data-ui="line-series"]')).toHaveLength(3);
  expect(screen.getByRole('img', { name: 'A, 0: 0' })).toBeTruthy();
  expect(screen.getByRole('table', { name: 'Измерения: Данные' }).textContent).toContain('—');
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
  act(() => start.focus()); fireEvent.keyDown(start, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'A, 10: 80' }));
  expect(within(screen.getByRole('tooltip')).getByRole('row', { name: 'A 80' })).toBeTruthy();
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});
it('uses nearest-point search between vertices, not only circle hover', () => {
  vi.useFakeTimers();
  render(<adapters.LineChartAdapter {...props} />);
  const plot = document.querySelector<SVGSVGElement>('[data-ui="line-plot"]')!;
  vi.spyOn(plot, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 500, height: 300 } as DOMRect);
  fireEvent(plot, new MouseEvent('pointermove', { clientX: 50, clientY: 265, bubbles: true }));
  expect(screen.queryByRole('tooltip')).toBeNull();
  act(() => vi.advanceTimersByTime(100));
  expect(within(screen.getByRole('tooltip')).getByRole('row', { name: 'A 0' })).toBeTruthy();
});
it('forwards point refs and allows consumers to cancel keyboard navigation', () => {
  const ref = createRef<SVGCircleElement>();
  const { unmount } = render(<adapters.LineChartAdapter {...props} slotProps={{ point: () => ({ ref, onKeyDown: event => event.preventDefault() }) }} />);
  expect(ref.current).toBeTruthy();
  const point = screen.getByRole('img', { name: 'A, 0: 0' });
  point.focus(); fireEvent.keyDown(point, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(point);
  unmount(); expect(ref.current).toBeNull();
});
it('keeps SSR data accessible and observes the container with cleanup', () => {
  const { width, height, ...adaptive } = props;
  const server = document.createElement('div');
  server.innerHTML = renderToString(<adapters.LineChartAdapter {...adaptive} />);
  expect(server.querySelector('caption')?.textContent).toBe('Измерения: Данные');
  let callback: ResizeObserverCallback, target: Element;
  const disconnect = vi.fn();
  vi.stubGlobal('ResizeObserver', class {
    constructor(next: ResizeObserverCallback) { callback = next; }
    observe(element: Element) { target = element; }
    disconnect = disconnect;
  });
  const { container, unmount } = render(<adapters.LineChartAdapter {...adaptive} />);
  expect(container.querySelector('svg')).toBeNull();
  act(() => callback!([{ target: target!, contentRect: { width: 500 } }] as ResizeObserverEntry[], {} as ResizeObserver));
  expect(container.querySelector('svg')?.getAttribute('width')).toBe('500');
  unmount(); expect(disconnect).toHaveBeenCalledOnce();
});
it('waits for controlled visibility and retains full data while hiding lines', () => {
  const changed = vi.fn();
  const { container } = render(<adapters.LineChartAdapter {...props} visibleSeries={['a', 'b']} onVisibleSeriesChange={changed} />);
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
  fireEvent(document.querySelector('[data-ui="line-plot"]')!, new MouseEvent('pointerout', { relatedTarget: tooltip, bubbles: true }));
  fireEvent.pointerEnter(tooltip);
  expect(within(tooltip).getByRole('row', { name: 'A 80' })).toBeTruthy();
  fireEvent.pointerLeave(tooltip);
  expect(within(screen.getByRole('tooltip')).getByRole('row', { name: 'A 0' })).toBeTruthy();
});
