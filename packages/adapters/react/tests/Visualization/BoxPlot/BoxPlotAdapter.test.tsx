import { afterEach, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/Visualization/BoxPlot/index.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const data = [
  { id: 'a', label: 'Команда A', values: [1, 2, 3, 4, 5, 6, 7, 100, 100] },
  { id: 'b', label: 'Команда B', values: [5, 5, 5] },
  { id: 'c', label: 'Без измерений', values: [] },
];

it('exposes quartiles and exact outliers in tooltip and table with keyboard navigation', () => {
  render(<adapters.BoxPlotAdapter label="Сроки" data={data} />);
  const images = screen.getAllByRole('img');
  expect(images).toHaveLength(2);
  act(() => images[0].focus());
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toContain('Медиана5');
  expect(tooltip.textContent).toContain('Q13');
  expect(tooltip.textContent).toContain('Q37');
  expect(tooltip.textContent).toContain('100 × 2');
  expect(tooltip.querySelector('[data-ui="mark"]')).toBeTruthy();
  fireEvent.keyDown(images[0], { key: 'ArrowDown' });
  expect(document.activeElement).toBe(images[1]);
  fireEvent.keyDown(images[1], { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Сроки: Статистика' });
  expect(within(table).getByText('100 × 2')).toBeTruthy();
  const empty = within(table).getByRole('row', { name: /Без измерений/ });
  expect(empty.textContent).toContain('Нет данных');
});

it('does not reopen a hovered old group after keyboard focus has moved', () => {
  vi.useFakeTimers();
  render(<adapters.BoxPlotAdapter label="Сроки" data={data} />);
  const images = screen.getAllByRole('img');
  fireEvent.pointerEnter(images[0]);
  act(() => images[0].focus());
  fireEvent.keyDown(images[0], { key: 'ArrowDown' });
  act(() => vi.advanceTimersByTime(150));
  expect(screen.getByRole('tooltip').textContent).toContain('Команда B');
  expect(screen.getByRole('tooltip').textContent).not.toContain('Команда A');
});

it('pages both plot and table and removes stale tooltips when data changes', () => {
  const { rerender } = render(<adapters.BoxPlotAdapter label="Сроки" data={data} pageSize={1} />);
  act(() => screen.getByRole('img').focus());
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Команда B');
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Предыдущая страница данных' }));
  expect(screen.queryByRole('tooltip')).toBeNull();
  rerender(<adapters.BoxPlotAdapter label="Сроки" data={[]} pageSize={1} />);
  expect(screen.queryAllByRole('img')).toHaveLength(0);
  expect(screen.getByText('Нет данных')).toBeTruthy();
});

it('composes groups, axis and table around shared pages without changing the full scale', () => {
  expect(adapters.BoxPlotAdapter.Plot).toBeTypeOf('function');
  function Controls() {
    const { layout, page } = adapters.useBoxPlot();
    return (
      <button onClick={() => page.change(2)}>
        Scale {layout.domain?.join(':')}, page {page.page}
      </button>
    );
  }
  const ref = createRef<HTMLSpanElement>();
  const { unmount } = render(
    <adapters.BoxPlotAdapter
      label="Сроки"
      data={data}
      pageSize={1}
      slotProps={{ group: () => ({ ref }) }}
    >
      <Controls />
      <adapters.BoxPlotAdapter.Axis />
      <adapters.BoxPlotAdapter.Plot
        tooltipContent={({ group, defaultContent }) => (
          <div>
            {defaultContent}
            <p>Count {group.count}</p>
          </div>
        )}
      >
        {({ group, defaultContent }) => <span data-count={group.count}>{defaultContent}</span>}
      </adapters.BoxPlotAdapter.Plot>
      <adapters.BoxPlotAdapter.Table />
      <adapters.BoxPlotAdapter.Pagination />
      <adapters.BoxPlotAdapter.Empty />
    </adapters.BoxPlotAdapter>,
  );
  const first = screen.getByRole('img');
  expect(ref.current).toBe(first);
  expect(first.tagName).toBe('SPAN');
  expect(first.querySelector('[data-count="9"]')).toBeTruthy();
  act(() => first.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Count 9');
  expect(screen.getByRole('tooltip').textContent).toContain('100 × 2');
  fireEvent.click(screen.getByRole('button', { name: 'Scale 1:100, page 1' }));
  expect(screen.getByRole('button', { name: 'Scale 1:100, page 2' })).toBeTruthy();
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Команда B');
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(within(screen.getByRole('table')).queryByText('Команда A')).toBeNull();
  unmount();
  expect(ref.current).toBeNull();
});

it('keeps cancellation, roving focus and optional tooltip content with custom glyphs', () => {
  expect(adapters.BoxPlotAdapter.Plot).toBeTypeOf('function');
  render(
    <adapters.BoxPlotAdapter
      label="Сроки"
      data={data}
      slotProps={{
        group: () => ({
          onKeyDown: (event) => {
            if (event.key === 'ArrowDown') event.preventDefault();
          },
        }),
      }}
    >
      <adapters.BoxPlotAdapter.Plot
        tooltipContent={({ group, defaultContent }) => (group.id === 'a' ? null : defaultContent)}
      >
        {({ defaultContent }) => defaultContent}
      </adapters.BoxPlotAdapter.Plot>
    </adapters.BoxPlotAdapter>,
  );
  const [first, second] = screen.getAllByRole('img');
  act(() => first.focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(first, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(first);
  fireEvent.keyDown(first, { key: 'End' });
  expect(document.activeElement).toBe(second);
  expect(first.tabIndex).toBe(-1);
  expect(second.tabIndex).toBe(0);
  expect(screen.getByRole('tooltip').textContent).toContain('Команда B');
  fireEvent.keyDown(second, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('allows empty composition and requires a BoxPlot root for the context hook', () => {
  expect(adapters.useBoxPlot).toBeTypeOf('function');
  const { rerender } = render(
    <adapters.BoxPlotAdapter label="Сроки" data={data}>
      {null}
    </adapters.BoxPlotAdapter>,
  );
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByRole('table')).toBeNull();
  rerender(
    <adapters.BoxPlotAdapter label="Сроки" data={[]}>
      <adapters.BoxPlotAdapter.Empty />
    </adapters.BoxPlotAdapter>,
  );
  expect(screen.getByText('Нет данных')).toBeTruthy();
  function Outside() {
    adapters.useBoxPlot();
    return null;
  }
  expect(() => render(<Outside />)).toThrow(/BoxPlot/);
});
