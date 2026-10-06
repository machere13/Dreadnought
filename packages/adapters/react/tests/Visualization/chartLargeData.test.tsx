import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { BarChartAdapter, LineChartAdapter } from '../../src/unstyled.ts';

afterEach(cleanup);
it('keeps grouped bars readable and reveals the focused series inside an oversized category', () => {
  const categories = [{ id: 'one', label: 'One' }];
  const series = Array.from({ length: 20 }, (_, index) => ({ id: String(index), label: `Series ${index}`, values: { one: 1 } }));
  render(<BarChartAdapter label="Grouped" categories={categories} series={series} visibleSeries={series.map(item => item.id).reverse()} domain={[0, 2]} width={500} height={300} />);
  const first = screen.getByRole('img', { name: 'Series 0, One: 1' });
  expect(Number(first.querySelector('rect')!.getAttribute('width'))).toBeGreaterThanOrEqual(16);
  act(() => first.focus()); fireEvent.keyDown(first, { key: 'End' });
  const last = document.activeElement!;
  expect(last.getAttribute('aria-label')).toBe('Series 19, One: 1');
  const end = last.querySelector('rect')!;
  expect(Number(end.getAttribute('x'))).toBeGreaterThanOrEqual(0);
  expect(Number(end.getAttribute('x')) + Number(end.getAttribute('width'))).toBeLessThanOrEqual(436);
  fireEvent.keyDown(last, { key: 'Home' });
  expect(document.activeElement).toBe(first);
  expect(Number(first.querySelector('rect')!.getAttribute('x'))).toBeGreaterThanOrEqual(0);
});

it('virtualizes bars, reaches the last category by keyboard and paginates original data', () => {
  const categories = Array.from({ length: 10000 }, (_, index) => ({ id: String(index), label: `Category ${index}` }));
  const series = [{ id: 'a', label: 'A', values: Object.fromEntries(categories.map(category => [category.id, 1])) }];
  const { container } = render(<BarChartAdapter label="Bars" categories={categories} series={series} domain={[0, 2]} width={500} height={300} />);
  expect(container.querySelectorAll('[data-ui="bar-item"]').length).toBeLessThan(20);
  const table = screen.getByRole('table', { name: 'Bars: Данные' });
  expect(within(table).getAllByRole('row').length).toBeLessThanOrEqual(51);
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(within(table).getByRole('rowheader', { name: 'Category 50' })).toBeTruthy();
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Страница данных' }), { target: { value: 200 } });
  expect(within(table).getByRole('rowheader', { name: 'Category 9999' })).toBeTruthy();
  const first = screen.getByRole('img', { name: 'A, Category 0: 1' });
  act(() => first.focus()); fireEvent.keyDown(first, { key: 'End' });
  expect(document.activeElement?.getAttribute('aria-label')).toBe('A, Category 9999: 1');
  expect(container.querySelectorAll('[data-ui="bar-item"]').length).toBeLessThan(20);
});

it('bounds line marks, offers zoom and retains exact unsampled table values', () => {
  const data = Array.from({ length: 10000 }, (_, x) => ({ x, y: x === 4311 ? 100 : 0 }));
  const { container } = render(<LineChartAdapter label="Line" series={[{ id: 'a', label: 'A', data }]} xDomain={[0, 9999]} yDomain={[0, 100]} width={500} height={300} />);
  expect(container.querySelectorAll('[data-ui="line-point"]').length).toBeLessThan(1800);
  expect(screen.getByRole('img', { name: 'A, 4311: 100' })).toBeTruthy();
  const table = screen.getByRole('table', { name: 'Line: Данные' });
  expect(within(table).getAllByRole('row').length).toBeLessThanOrEqual(51);
  fireEvent.change(screen.getByRole('slider', { name: 'Начало диапазона' }), { target: { value: 4300 } });
  fireEvent.change(screen.getByRole('slider', { name: 'Конец диапазона' }), { target: { value: 4320 } });
  expect(screen.getByRole('img', { name: 'A, 4312: 0' })).toBeTruthy();
  expect(screen.queryByRole('img', { name: 'A, 0: 0' })).toBeNull();
});

it('shows an exact unsampled point on hover without reading the full input again', () => {
  let reads = 0;
  const data = Array.from({ length: 10000 }, (_, x) => ({ get x() { reads++; return x; }, y: 0 }));
  const { container } = render(<LineChartAdapter label="Exact" series={[{ id: 'a', label: 'A', data }]} xDomain={[0, 9999]} yDomain={[0, 100]} width={500} height={300} />);
  expect(screen.queryByRole('img', { name: 'A, 117: 0' })).toBeNull();
  const plot = container.querySelector<SVGSVGElement>('[data-ui="line-plot"]')!;
  vi.spyOn(plot, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 500, height: 300 } as DOMRect);
  reads = 0;
  fireEvent(plot, new MouseEvent('pointermove', { clientX: 48 + 436 * 117 / 9999, clientY: 268, bubbles: true }));
  expect(screen.getByRole('img', { name: 'A, 117: 0' })).toBeTruthy();
  expect(screen.getByRole('tooltip').textContent).toContain('117');
  expect(reads).toBe(0);
  const first = screen.getByRole('img', { name: 'A, 0: 0' });
  act(() => first.focus()); fireEvent.keyDown(first, { key: 'ArrowRight' });
  expect(document.activeElement?.getAttribute('aria-label')).toBe('A, 1: 0');
  const focused = document.activeElement;
  fireEvent(plot, new MouseEvent('pointermove', { clientX: 48 + 436 * 117 / 9999, clientY: 268, bubbles: true }));
  expect(document.activeElement).toBe(focused);
  fireEvent.pointerLeave(plot);
  expect(screen.getByRole('tooltip').textContent).toContain('1');
});

it('scrolls horizontal categories while keeping numerical ticks fixed and resets after replacing data', () => {
  const categories = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), label: `Category ${index}` }));
  const series = [{ id: 'a', label: 'A', values: Object.fromEntries(categories.map(category => [category.id, -1])) }];
  const props = { label: 'Horizontal', categories, series, domain: [-2, 2] as const, width: 500, height: 300, orientation: 'horizontal' as const };
  const { container, rerender } = render(<BarChartAdapter {...props} />);
  const scroll = container.querySelector<HTMLElement>('[data-ui="bar-scroll-container"]')!;
  const baseline = container.querySelector('[data-ui="bar-baseline"]')!.getAttribute('x1');
  fireEvent.scroll(scroll, { target: { scrollTop: 64 * 500 } });
  expect(screen.getByRole('img', { name: 'A, Category 500: -1' })).toBeTruthy();
  expect(screen.queryByRole('img', { name: 'A, Category 0: -1' })).toBeNull();
  expect(container.querySelector('[data-ui="bar-baseline"]')!.getAttribute('x1')).toBe(baseline);
  rerender(<BarChartAdapter {...props} categories={[{ id: 'one', label: 'One' }]} series={[{ id: 'a', label: 'A', values: { one: 1 } }]} />);
  expect(screen.getByRole('img', { name: 'A, One: 1' })).toBeTruthy();
  expect(scroll.scrollTop).toBe(0);
  expect(screen.queryByRole('navigation', { name: 'Страницы данных' })).toBeNull();
});
