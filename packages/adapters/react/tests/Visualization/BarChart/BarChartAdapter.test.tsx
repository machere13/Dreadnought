import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const props = {
  label: 'Sales',
  categories: [
    { id: 'one', label: 'One' },
    { id: 'two', label: 'Two' },
  ],
  series: [
    { id: 'a', label: 'A', values: { one: 10, two: -10 } },
    { id: 'b', label: 'B', values: { one: 0, two: null } },
  ],
  domain: [-20, 20] as const,
  width: 500,
  height: 300,
};
it('renders signed grouped bars and retains original values in the table', () => {
  expect(adapters).toHaveProperty('BarChartAdapter');
  const { container } = render(<adapters.BarChartAdapter {...props} />);
  expect(container.querySelectorAll('[data-ui="bar-rect"]')).toHaveLength(3);
  expect(screen.getByRole('img', { name: 'A, Two: -10' })).toBeTruthy();
  expect(screen.getByRole('table').textContent).toContain('—');
});
it('shows a category tooltip with aligned series rows and keeps it open during keyboard navigation', () => {
  render(<adapters.BarChartAdapter {...props} />);
  const first = screen.getByRole('img', { name: 'A, One: 10' });
  act(() => first.focus());
  expect(within(screen.getByRole('tooltip')).getByRole('row', { name: 'A 10' })).toBeTruthy();
  expect(within(screen.getByRole('tooltip')).getByRole('row', { name: 'B 0' })).toBeTruthy();
  fireEvent.keyDown(first, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'B, One: 0' }));
  expect(screen.getByRole('tooltip').querySelectorAll('[data-ui="mark"]')).toHaveLength(2);
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});
it('hides series without removing table values and waits for controlled visibility', () => {
  const changed = vi.fn();
  const { container, rerender } = render(
    <adapters.BarChartAdapter
      {...props}
      visibleSeries={['a', 'b']}
      onVisibleSeriesChange={changed}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'A' }));
  expect(changed).toHaveBeenCalledWith(['b']);
  expect(container.querySelectorAll('[data-ui="bar-rect"]')).toHaveLength(3);
  rerender(<adapters.BarChartAdapter {...props} visibleSeries={['b']} />);
  expect(container.querySelectorAll('[data-ui="bar-rect"]')).toHaveLength(1);
  expect(screen.getByRole('table').textContent).toContain('-10');
});
it('navigates horizontal groups vertically and lets the caller cancel navigation', () => {
  render(
    <adapters.BarChartAdapter
      {...props}
      orientation="horizontal"
      slotProps={{
        bar: () => ({
          onKeyDown: (event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
            }
          },
        }),
      }}
    />,
  );
  const first = screen.getByRole('img', { name: 'A, One: 10' });
  act(() => first.focus());
  fireEvent.keyDown(first, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(first);
  fireEvent.keyDown(first, { key: 'End' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'A, Two: -10' }));
});
it('restores the focused bar when the pointer leaves another bar into plot whitespace', () => {
  render(<adapters.BarChartAdapter {...props} />);
  const first = screen.getByRole('img', { name: 'A, One: 10' });
  const other = screen.getByRole('img', { name: 'A, Two: -10' });
  act(() => first.focus());
  fireEvent.pointerEnter(other);
  expect(screen.getByRole('tooltip').textContent).toContain('Two');
  fireEvent(
    other,
    new MouseEvent('pointerout', { bubbles: true, relatedTarget: other.closest('svg') }),
  );
  expect(screen.getByRole('tooltip').textContent).toContain('One');
});
