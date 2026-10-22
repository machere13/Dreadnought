import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const props = {
  label: 'Team activity',
  columns: [
    { id: 'mon', label: 'Monday' },
    { id: 'tue', label: 'Tuesday' },
  ],
  rows: [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
  ],
  data: [
    { column: 'mon', row: 'a', value: 0 },
    { column: 'tue', row: 'a', value: 10 },
  ],
};
const cells = () => screen.getAllByRole('img');

it('exports a keyboard-accessible matrix with zero, missing data and a scale', () => {
  expect(adapters).toHaveProperty('HeatmapAdapter');
  render(<adapters.HeatmapAdapter {...props} />);
  expect(cells()).toHaveLength(4);
  expect(cells()[0].getAttribute('aria-label')).toContain('0');
  expect(cells()[2].getAttribute('aria-label')).toContain('Нет данных');
  expect(cells().filter((cell) => cell.tabIndex === 0)).toHaveLength(1);
  expect(screen.getByRole('group', { name: 'Цветовая шкала' })).toBeTruthy();
  fireEvent.focus(cells()[0]);
  fireEvent.keyDown(cells()[0], { key: 'ArrowDown' });
  expect(document.activeElement).toBe(cells()[2]);
  fireEvent.keyDown(cells()[2], { key: 'ArrowRight' });
  expect(document.activeElement).toBe(cells()[3]);
  fireEvent.keyDown(cells()[3], { key: 'Home' });
  expect(document.activeElement).toBe(cells()[2]);
  fireEvent.keyDown(cells()[2], { key: 'ArrowDown' });
  expect(document.activeElement).toBe(cells()[2]);
  fireEvent.keyDown(cells()[2], { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('shows exact values in a shared tooltip with a marker and restores focus after hover', () => {
  vi.useFakeTimers();
  render(<adapters.HeatmapAdapter {...props} formatValue={(value) => `${value} tasks`} />);
  fireEvent.pointerEnter(cells()[0]);
  expect(screen.queryByRole('tooltip')).toBeNull();
  act(() => vi.advanceTimersByTime(100));
  expect(within(screen.getByRole('tooltip')).getByText('0 tasks')).toBeTruthy();
  expect(screen.getByRole('tooltip').querySelector('[data-ui="mark"]')).toBeTruthy();
  fireEvent.focus(cells()[0]);
  fireEvent.pointerEnter(cells()[1]);
  expect(within(screen.getByRole('tooltip')).getByText('10 tasks')).toBeTruthy();
  fireEvent.pointerLeave(cells()[1]);
  expect(within(screen.getByRole('tooltip')).getByText('0 tasks')).toBeTruthy();
});

it('paginates the full matrix table without removing cells and resets stale tooltips', () => {
  const view = render(<adapters.HeatmapAdapter {...props} pageSize={2} />);
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(within(screen.getByRole('table')).getAllByText('Нет данных')).toHaveLength(2);
  expect(cells()).toHaveLength(4);
  fireEvent.focus(cells()[0]);
  view.rerender(<adapters.HeatmapAdapter {...props} columns={[]} rows={[]} data={[]} />);
  expect(screen.queryAllByRole('img')).toHaveLength(0);
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(screen.getByText('Нет значений для отображения')).toBeTruthy();
  view.rerender(<adapters.HeatmapAdapter {...props} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.focus(cells()[0]);
  expect(within(screen.getByRole('tooltip')).getByText('0')).toBeTruthy();
});

it('retains a hovered cell while entering its tooltip and updates a focused value', () => {
  const view = render(<adapters.HeatmapAdapter {...props} />);
  fireEvent.focus(cells()[0]);
  fireEvent.pointerEnter(cells()[1]);
  const tooltip = screen.getByRole('tooltip');
  fireEvent(cells()[1], new MouseEvent('pointerout', { relatedTarget: tooltip, bubbles: true }));
  fireEvent.pointerEnter(tooltip);
  expect(within(tooltip).getByText('10')).toBeTruthy();
  fireEvent.pointerLeave(tooltip);
  expect(within(tooltip).getByText('0')).toBeTruthy();
  view.rerender(<adapters.HeatmapAdapter {...props} data={[]} />);
  expect(within(screen.getByRole('tooltip')).getByText('Нет данных')).toBeTruthy();
  expect(screen.queryByRole('group', { name: 'Цветовая шкала' })).toBeNull();
});

it('preserves slot refs and allows keyboard cancellation without losing ownership of labels', () => {
  const ref = { current: null as HTMLSpanElement | null };
  render(
    <adapters.HeatmapAdapter
      {...props}
      slotProps={{
        cell: () => ({ ref, onKeyDown: (event) => event.preventDefault() }),
      }}
    />,
  );
  expect(ref.current).toBe(cells()[3]);
  act(() => cells()[0].focus());
  fireEvent.keyDown(cells()[0], { key: 'ArrowRight' });
  expect(document.activeElement).toBe(cells()[0]);
});
