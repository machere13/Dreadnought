import { afterEach, expect, it } from 'vitest';
import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/Visualization/Histogram/index.ts';

afterEach(cleanup);
const props = { label: 'Время ответа', data: [0, 1, 2, 3, 4], bins: 2, width: 500, height: 300 };

it('shows exact intervals, counts and shares in the table and tooltip', () => {
  render(<adapters.HistogramAdapter {...props} />);
  const first = screen.getByRole('img', { name: 'Наблюдения, [0; 2): 2 (40%)' });
  act(() => first.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('2 (40%)');
  expect(screen.getByRole('tooltip').querySelector('[data-ui="mark"]')).toBeTruthy();
  fireEvent.keyDown(first, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(
    screen.getByRole('img', { name: 'Наблюдения, [2; 4]: 3 (60%)' }),
  );
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(within(screen.getByRole('table')).getByText('3 (60%)')).toBeTruthy();
  expect(
    within(screen.getByRole('table')).getByRole('columnheader', {
      name: 'Наблюдения',
      exact: true,
    }),
  ).toBeTruthy();
  const svg = first.closest('svg')!;
  const ticks = Array.from(svg.querySelectorAll('text')).map((node) => node.textContent);
  expect(ticks).toContain('1');
  expect(ticks).not.toContain('1 (20%)');
});

it('recomputes intervals on configuration changes without changing the source', () => {
  const { rerender } = render(<adapters.HistogramAdapter {...props} />);
  rerender(
    <adapters.HistogramAdapter {...props} bins={1} formatBoundary={(value) => `${value} мс`} />,
  );
  expect(screen.getByRole('img', { name: 'Наблюдения, [0 мс; 4 мс]: 5 (100%)' })).toBeTruthy();
  expect(screen.getAllByRole('img')).toHaveLength(1);
  rerender(<adapters.HistogramAdapter {...props} data={[]} />);
  expect(screen.getByText('Нет данных')).toBeTruthy();
  expect(screen.queryAllByRole('img')).toHaveLength(0);
});

it('composes bin drawing and tooltip with the exact histogram model and shared table page', () => {
  expect(adapters.HistogramAdapter.Plot).toBeTypeOf('function');
  function Controls() {
    const { layout, page } = adapters.useHistogram();
    return (
      <button onClick={() => page.change(2)}>
        Total {layout.total}, page {page.page}
      </button>
    );
  }
  render(
    <adapters.HistogramAdapter {...props} pageSize={1}>
      <Controls />
      <adapters.HistogramAdapter.Plot
        tooltipContent={({ bin, defaultContent }) => (
          <div>
            {defaultContent}
            <span>Share {bin.proportion}</span>
          </div>
        )}
      >
        {({ bin, bar, defaultContent }) => (
          <g data-count={bin.count}>
            {defaultContent}
            <text x={bar.x} y={bar.y}>
              {bin.count}
            </text>
          </g>
        )}
      </adapters.HistogramAdapter.Plot>
      <adapters.HistogramAdapter.Table />
      <adapters.HistogramAdapter.Pagination />
      <adapters.HistogramAdapter.Empty />
    </adapters.HistogramAdapter>,
  );
  const first = screen.getByRole('img', { name: 'Наблюдения, [0; 2): 2 (40%)' });
  expect(first.querySelector('[data-count="2"]')).toBeTruthy();
  act(() => first.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Share 0.4');
  fireEvent.keyDown(first, { key: 'End' });
  expect(document.activeElement?.getAttribute('aria-label')).toContain('[2; 4]');
  fireEvent.click(screen.getByRole('button', { name: 'Total 5, page 1' }));
  expect(screen.getByRole('button', { name: 'Total 5, page 2' })).toBeTruthy();
  expect(screen.getAllByRole('img')).toHaveLength(2);
  const table = screen.getByRole('table', { name: 'Время ответа: Данные' });
  expect(within(table).queryByText('2 (40%)')).toBeNull();
  expect(within(table).getByText('3 (60%)')).toBeTruthy();
});

it('supports explicit empty composition and rejects a histogram hook outside its root', () => {
  expect(adapters.useHistogram).toBeTypeOf('function');
  const { rerender } = render(
    <adapters.HistogramAdapter {...props}>{null}</adapters.HistogramAdapter>,
  );
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByRole('table')).toBeNull();
  rerender(
    <adapters.HistogramAdapter {...props} data={[]}>
      <adapters.HistogramAdapter.Empty />
    </adapters.HistogramAdapter>,
  );
  expect(screen.getByText('Нет данных')).toBeTruthy();
  function Outside() {
    adapters.useHistogram();
    return null;
  }
  expect(() => render(<Outside />)).toThrow(/Histogram/);
});

it('keeps virtualized navigation, interval identity and native refs with custom drawing', () => {
  const ref = createRef<SVGGElement>();
  render(
    <adapters.HistogramAdapter
      label="Длинный ряд"
      data={[0, 1000]}
      bins={1000}
      width={500}
      height={300}
      slotProps={{ bar: (_, bar) => (bar.categoryId === '0' ? { ref } : {}) }}
    >
      <adapters.HistogramAdapter.Plot
        tooltipContent={({ bin, defaultContent }) => (bin.lower === 0 ? null : defaultContent)}
      >
        {({ bin, defaultContent }) => <g data-lower={bin.lower}>{defaultContent}</g>}
      </adapters.HistogramAdapter.Plot>
    </adapters.HistogramAdapter>,
  );
  const first = screen.getByRole('img', { name: 'Наблюдения, [0; 1): 1 (50%)' });
  expect(ref.current).toBe(first);
  act(() => first.focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(first, { key: 'End' });
  const last = screen.getByRole('img', { name: 'Наблюдения, [999; 1000]: 1 (50%)' });
  expect(document.activeElement).toBe(last);
  expect(last.querySelector('[data-lower="999"]')).toBeTruthy();
  expect(screen.getAllByRole('img').length).toBeLessThan(10);
  expect(ref.current).toBeNull();
  expect(screen.getByRole('tooltip').textContent).toContain('1 (50%)');
});
