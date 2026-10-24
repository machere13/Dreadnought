import { afterEach, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/Visualization/WaterfallChart/index.ts';

afterEach(cleanup);
const data = [
  { id: 'a', label: 'Начало', kind: 'start', value: 100 },
  { id: 'b', label: 'Доход', kind: 'change', value: 40 },
  { id: 'c', label: 'Подытог', kind: 'total' },
  { id: 'd', label: 'Расход', kind: 'change', value: -25 },
  { id: 'e', label: 'Остаток', kind: 'total' },
] as const;

it('composes drawing and shared pages without recomputing totals or losing native refs', () => {
  expect(adapters.WaterfallChartAdapter.Plot).toBeTypeOf('function');
  const ref = createRef<HTMLSpanElement>();
  function Controls() {
    const { layout, page } = adapters.useWaterfallChart();
    return (
      <button onClick={() => page.change(2)}>
        Steps {layout.steps.length}, page {page.page}
      </button>
    );
  }
  const { unmount } = render(
    <adapters.WaterfallChartAdapter
      data={data}
      label="Бюджет"
      pageSize={3}
      slotProps={{ step: (step) => (step.id === 'a' ? { ref } : {}) }}
    >
      <Controls />
      <adapters.WaterfallChartAdapter.Plot
        tooltipContent={({ step, defaultContent }) => (
          <div>
            {defaultContent}
            <p>Step {step.id}</p>
          </div>
        )}
      >
        {({ step, baseline, defaultContent }) => (
          <span data-after={step.after} data-baseline={baseline}>
            {defaultContent}
          </span>
        )}
      </adapters.WaterfallChartAdapter.Plot>
      <adapters.WaterfallChartAdapter.Table />
      <adapters.WaterfallChartAdapter.Pagination />
      <adapters.WaterfallChartAdapter.Empty />
    </adapters.WaterfallChartAdapter>,
  );
  const first = screen.getByRole('img', { name: 'Начало: 100' });
  expect(ref.current).toBe(first);
  const baseline = first.querySelector('[data-baseline]')?.getAttribute('data-baseline');
  act(() => first.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Step a');
  fireEvent.click(screen.getByRole('button', { name: 'Steps 5, page 1' }));
  expect(screen.getAllByRole('img')).toHaveLength(2);
  expect(ref.current).toBeNull();
  const last = screen.getByRole('img', { name: 'Остаток: 115' });
  expect(last.querySelector('[data-after="115"]')?.getAttribute('data-baseline')).toBe(baseline);
  expect(
    within(screen.getByRole('table')).getByRole('row', { name: 'Остаток Итог 115 115 115' }),
  ).toBeTruthy();
  expect(screen.queryByRole('tooltip')).toBeNull();
  unmount();
  expect(ref.current).toBeNull();
});

it('retains keyboard cancellation and nullable tooltips for custom steps', () => {
  expect(adapters.WaterfallChartAdapter.Plot).toBeTypeOf('function');
  render(
    <adapters.WaterfallChartAdapter
      data={data}
      label="Бюджет"
      slotProps={{
        step: () => ({
          onKeyDown: (e) => {
            if (e.key === 'ArrowRight') e.preventDefault();
          },
        }),
      }}
    >
      <adapters.WaterfallChartAdapter.Plot
        tooltipContent={({ step, defaultContent }) => (step.id === 'a' ? null : defaultContent)}
      >
        {({ defaultContent }) => defaultContent}
      </adapters.WaterfallChartAdapter.Plot>
    </adapters.WaterfallChartAdapter>,
  );
  const stages = screen.getAllByRole('img');
  act(() => stages[0].focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(stages[0], { key: 'ArrowRight' });
  expect(document.activeElement).toBe(stages[0]);
  fireEvent.keyDown(stages[0], { key: 'End' });
  expect(document.activeElement).toBe(stages[4]);
  expect(screen.getByRole('tooltip').textContent).toContain('После шага115');
  fireEvent.keyDown(stages[4], { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('supports explicit null composition and scopes its context hook', () => {
  expect(adapters.useWaterfallChart).toBeTypeOf('function');
  const { rerender } = render(
    <adapters.WaterfallChartAdapter data={data} label="Бюджет">
      {null}
    </adapters.WaterfallChartAdapter>,
  );
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByRole('table')).toBeNull();
  rerender(
    <adapters.WaterfallChartAdapter data={[]} label="Бюджет">
      <adapters.WaterfallChartAdapter.Empty />
    </adapters.WaterfallChartAdapter>,
  );
  expect(screen.getByText('Нет данных')).toBeTruthy();
  function Outside() {
    adapters.useWaterfallChart();
    return null;
  }
  expect(() => render(<Outside />)).toThrow(/WaterfallChart/);
});

it('shows signed changes, exact subtotal values and keyboard tooltips', () => {
  render(<adapters.WaterfallChartAdapter data={data} label="Бюджет" />);
  const first = screen.getByRole('img', { name: 'Начало: 100' });
  act(() => first.focus());
  fireEvent.keyDown(first, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'Доход: +40' }));
  expect(screen.getByRole('tooltip').textContent).toContain('До шага100');
  expect(screen.getByRole('tooltip').textContent).toContain('После шага140');
  fireEvent.keyDown(document.activeElement!, { key: 'End' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'Остаток: 115' }));
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Бюджет: Данные' });
  expect(within(table).getByRole('row', { name: 'Подытог Итог 140 140 140' })).toBeTruthy();
});

it('paginates without recomputing totals or the vertical scale', () => {
  const { container } = render(
    <adapters.WaterfallChartAdapter data={data} label="Бюджет" pageSize={3} />,
  );
  const baseline = container.querySelector('[data-ui="waterfall-baseline"]')?.getAttribute('y1');
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.getAllByRole('img')).toHaveLength(2);
  expect(screen.getByRole('img', { name: 'Расход: −25' })).toBeTruthy();
  expect(screen.getByRole('img', { name: 'Остаток: 115' })).toBeTruthy();
  const totalBar = screen
    .getByRole('img', { name: 'Остаток: 115' })
    .querySelector('[data-ui="waterfall-bar"]');
  expect(Number(totalBar?.getAttribute('y'))).toBeCloseTo(17.8571428571);
  expect(container.querySelector('[data-ui="waterfall-baseline"]')?.getAttribute('y1')).toBe(
    baseline,
  );
  expect(container.querySelectorAll('[data-ui="waterfall-connector"]')).toHaveLength(1);
});

it('keeps zero changes focusable and replaces stale data and tooltips', () => {
  const { rerender, container } = render(
    <adapters.WaterfallChartAdapter
      label="Нули"
      data={[{ id: 'zero', label: 'Без изменений', kind: 'change', value: 0 }]}
    />,
  );
  act(() => screen.getByRole('img').focus());
  expect(container.querySelector('[data-ui="waterfall-bar"]')?.getAttribute('height')).toBe('0');
  expect(screen.getByRole('tooltip')).toBeTruthy();
  rerender(<adapters.WaterfallChartAdapter label="Нули" data={[]} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(screen.getByText('Нет данных')).toBeTruthy();
});

it('does not let an old hover timer replace the focused step tooltip', () => {
  vi.useFakeTimers();
  try {
    render(<adapters.WaterfallChartAdapter data={data} label="Бюджет" />);
    fireEvent.pointerEnter(screen.getByRole('img', { name: 'Начало: 100' }), {
      pointerType: 'mouse',
    });
    act(() => screen.getByRole('img', { name: 'Доход: +40' }).focus());
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(screen.getByRole('tooltip').textContent).toContain('Доход');
  } finally {
    vi.useRealTimers();
  }
});
