import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const data = [
  { id: 'a', label: 'Alpha', value: 30 },
  { id: 'b', label: 'Beta', value: 70 },
  { id: 'zero', label: 'Zero', value: 0 },
];
const props = { data, label: 'Budget', width: 400, height: 320 };

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
