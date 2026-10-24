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
it('composes custom bars, tooltips, legend and shared table pagination', () => {
  const Chart = adapters.BarChartAdapter;
  function Controls() {
    const { visible, toggle, page } = adapters.useBarChart();
    return (
      <>
        <button onClick={() => toggle('a')}>Visible {visible.join(',')}</button>
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
        {({ bar }) => (
          <rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={4}
            data-testid="custom-bar"
          />
        )}
      </Chart.Plot>
      <Chart.Table />
      <Chart.Pagination />
      <Chart.Empty />
    </Chart>,
  );
  expect(container.querySelectorAll('[data-testid="custom-bar"]')).toHaveLength(3);
  expect(container.querySelector('[data-ui="bar-rect"]')).toBeNull();
  act(() => screen.getByRole('img', { name: 'A, One: 10' }).focus());
  fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
  expect(document.activeElement?.getAttribute('aria-label')).toBe('B, One: 0');
  expect(screen.getByRole('tooltip').textContent).toContain('Custom tooltip');
  fireEvent.click(screen.getByRole('button', { name: 'Page custom' }));
  expect(screen.getByRole('spinbutton').getAttribute('value')).toBe('2');
  expect(screen.getByRole('table', { name: 'Sales: Данные' }).textContent).toContain('Two');
  expect(screen.getByRole('img', { name: 'A, One: 10' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Visible a,b' }));
  expect(screen.queryByRole('img', { name: 'A, One: 10' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Series A' }).getAttribute('aria-pressed')).toBe(
    'false',
  );
  expect(screen.getByRole('table', { name: 'Sales: Данные' }).textContent).toContain('-10');
});

it('retains navigation without custom tooltip and renders only explicitly chosen parts', () => {
  const Chart = adapters.BarChartAdapter;
  const { rerender } = render(
    <Chart {...props}>
      <Chart.Plot tooltipContent={() => null} />
    </Chart>,
  );
  expect(screen.queryByRole('table')).toBeNull();
  act(() => screen.getByRole('img', { name: 'A, One: 10' }).focus());
  fireEvent.keyDown(document.activeElement!, { key: 'End' });
  expect(document.activeElement?.getAttribute('aria-label')).toBe('A, Two: -10');
  expect(screen.queryByRole('tooltip')).toBeNull();
  rerender(<Chart {...props}>{null}</Chart>);
  expect(screen.queryByRole('img')).toBeNull();
  expect(() => render(<Chart.Plot />)).toThrow('BarChart');
});
it('renders signed grouped bars and retains original values in the table', () => {
  expect(adapters).toHaveProperty('BarChartAdapter');
  const { container } = render(<adapters.BarChartAdapter {...props} />);
  expect(container.querySelectorAll('[data-ui="bar-rect"]')).toHaveLength(3);
  expect(screen.getByRole('img', { name: 'A, Two: -10' })).toBeTruthy();
  expect(screen.getByRole('table').textContent).toContain('—');
});

it('opens custom content after a hidden tooltip and ignores unknown context IDs', () => {
  const Chart = adapters.BarChartAdapter;
  const changed = vi.fn();
  function Controls() {
    const { toggle, page } = adapters.useBarChart();
    return (
      <button
        onClick={() => {
          toggle('missing');
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
        tooltipContent={({ bar, defaultContent }) =>
          bar.categoryId === 'one' ? null : defaultContent
        }
      />
    </Chart>,
  );
  act(() => screen.getByRole('img', { name: 'A, One: 10' }).focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(document.activeElement!, { key: 'End' });
  expect(screen.getByRole('tooltip').textContent).toContain('-10');
  fireEvent.click(screen.getByRole('button', { name: 'Request' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith(['b']);
  expect(screen.getByRole('img', { name: 'A, One: 10' })).toBeTruthy();
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
it.each(['vertical', 'horizontal'] as const)(
  'keeps %s bar navigation on its axis without wrapping or handling IME input',
  (orientation) => {
    render(<adapters.BarChartAdapter {...props} orientation={orientation} />);
    const first = screen.getByRole('img', { name: 'A, One: 10' });
    const last = screen.getByRole('img', { name: 'A, Two: -10' });
    const forward = orientation === 'vertical' ? 'ArrowRight' : 'ArrowDown';
    const backward = orientation === 'vertical' ? 'ArrowLeft' : 'ArrowUp';
    const otherAxis = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    act(() => first.focus());
    fireEvent.keyDown(first, { key: backward });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: otherAxis });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: forward, isComposing: true });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: 'End' });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: forward });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: 'Home' });
    expect(document.activeElement).toBe(first);
  },
);

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
