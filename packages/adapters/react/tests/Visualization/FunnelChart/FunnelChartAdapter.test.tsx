import { afterEach, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/Visualization/FunnelChart/index.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const data = [
  { id: 'visit', label: 'Визиты', value: 100 },
  { id: 'cart', label: 'Корзина', value: 40 },
  { id: 'paid', label: 'Оплата', value: 10 },
];

it('composes drawing, tooltip and controls around the full funnel and shared pages', () => {
  expect(adapters.FunnelChartAdapter.Plot).toBeTypeOf('function');
  const ref = createRef<HTMLSpanElement>();
  function Controls() {
    const { layout, page } = adapters.useFunnelChart();
    return (
      <button onClick={() => page.change(2)}>
        Stages {layout.stages.length}, page {page.page}
      </button>
    );
  }
  const { unmount } = render(
    <adapters.FunnelChartAdapter
      label="Покупки"
      data={data}
      pageSize={1}
      slotProps={{ stage: () => ({ ref }) }}
    >
      <Controls />
      <adapters.FunnelChartAdapter.Plot
        tooltipContent={({ stage, defaultContent }) => (
          <div>
            {defaultContent}
            <p>Stage {stage.id}</p>
          </div>
        )}
      >
        {({ stage, defaultContent }) => <span data-value={stage.value}>{defaultContent}</span>}
      </adapters.FunnelChartAdapter.Plot>
      <adapters.FunnelChartAdapter.Table />
      <adapters.FunnelChartAdapter.Pagination />
      <adapters.FunnelChartAdapter.Empty />
    </adapters.FunnelChartAdapter>,
  );
  const stage = screen.getByRole('img');
  expect(ref.current).toBe(stage);
  expect(stage.querySelector('[data-value="100"]')).toBeTruthy();
  act(() => stage.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Stage visit');
  fireEvent.click(screen.getByRole('button', { name: 'Stages 3, page 1' }));
  expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Корзина: 40');
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(
    within(screen.getByRole('table')).getByRole('row', { name: /Корзина 40 40% 40% 60/ }),
  ).toBeTruthy();
  unmount();
  expect(ref.current).toBeNull();
});

it('keeps keyboard cancellation and nullable tooltips with custom stages', () => {
  expect(adapters.FunnelChartAdapter.Plot).toBeTypeOf('function');
  render(
    <adapters.FunnelChartAdapter
      label="Покупки"
      data={data}
      slotProps={{
        stage: () => ({
          onKeyDown: (e) => {
            if (e.key === 'ArrowDown') e.preventDefault();
          },
        }),
      }}
    >
      <adapters.FunnelChartAdapter.Plot
        tooltipContent={({ stage, defaultContent }) =>
          stage.id === 'visit' ? null : defaultContent
        }
      >
        {({ defaultContent }) => defaultContent}
      </adapters.FunnelChartAdapter.Plot>
    </adapters.FunnelChartAdapter>,
  );
  const stages = screen.getAllByRole('img');
  act(() => stages[0].focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(stages[0], { key: 'ArrowDown' });
  expect(document.activeElement).toBe(stages[0]);
  fireEvent.keyDown(stages[0], { key: 'End' });
  expect(document.activeElement).toBe(stages[2]);
  expect(screen.getByRole('tooltip').textContent).toContain('От предыдущего25%');
  fireEvent.keyDown(stages[2], { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('allows explicit null composition and scopes its hook', () => {
  expect(adapters.useFunnelChart).toBeTypeOf('function');
  const { rerender } = render(
    <adapters.FunnelChartAdapter label="Покупки" data={data}>
      {null}
    </adapters.FunnelChartAdapter>,
  );
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByRole('table')).toBeNull();
  rerender(
    <adapters.FunnelChartAdapter label="Покупки" data={[]}>
      <adapters.FunnelChartAdapter.Empty />
    </adapters.FunnelChartAdapter>,
  );
  expect(screen.getByText('Нет данных')).toBeTruthy();
  function Outside() {
    adapters.useFunnelChart();
    return null;
  }
  expect(() => render(<Outside />)).toThrow(/FunnelChart/);
});

it('shows exact values and both conversions in accessible table and tooltip', () => {
  render(<adapters.FunnelChartAdapter label="Покупки" data={data} />);
  const stages = screen.getAllByRole('img');
  const points = stages[0]
    .querySelector('polygon')!
    .getAttribute('points')!
    .split(/[ ,]/)
    .map(Number);
  [2, 0, 98, 0, 69.2, 100, 30.8, 100].forEach((value, index) => {
    expect(points[index]).toBeCloseTo(value);
  });
  act(() => stages[0].focus());
  fireEvent.keyDown(stages[0], { key: 'End' });
  expect(document.activeElement).toBe(stages[2]);
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toContain('От первого10%');
  expect(tooltip.textContent).toContain('От предыдущего25%');
  expect(tooltip.textContent).toContain('Потеря30');
  expect(tooltip.querySelector('[data-ui="mark"]')).toBeTruthy();
  fireEvent.keyDown(stages[2], { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Покупки: Данные' });
  expect(within(table).getByRole('row', { name: /Оплата 10 10% 25% 30/ })).toBeTruthy();
});

it('does not let a hovered old stage steal the tooltip after keyboard navigation', () => {
  vi.useFakeTimers();
  render(<adapters.FunnelChartAdapter label="Покупки" data={data} />);
  const stages = screen.getAllByRole('img');
  fireEvent.pointerEnter(stages[0]);
  act(() => stages[0].focus());
  fireEvent.keyDown(stages[0], { key: 'ArrowDown' });
  act(() => vi.advanceTimersByTime(200));
  expect(screen.getByRole('tooltip').textContent).toContain('Корзина');
  expect(screen.getByRole('tooltip').textContent).not.toContain('Визиты');
});

it('pages without resetting conversions and clears stale popups when rows disappear', () => {
  const { rerender } = render(
    <adapters.FunnelChartAdapter label="Покупки" data={data} pageSize={1} />,
  );
  act(() => screen.getByRole('img').focus());
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Покупки: Данные' });
  expect(within(table).getByRole('row', { name: /Корзина 40 40% 40% 60/ })).toBeTruthy();
  rerender(<adapters.FunnelChartAdapter label="Покупки" data={[]} />);
  expect(screen.queryAllByRole('img')).toHaveLength(0);
  expect(screen.getByText('Нет данных')).toBeTruthy();
});

it('keeps zero stages focusable without drawing nonzero shapes or undefined percentages', () => {
  const zero = [
    { id: 'a', label: 'Первый', value: 0 },
    { id: 'b', label: 'Второй', value: 0 },
  ];
  render(<adapters.FunnelChartAdapter label="Пустой запуск" data={zero} />);
  const stages = screen.getAllByRole('img');
  expect(stages).toHaveLength(2);
  expect(stages.every((stage) => !stage.querySelector('polygon'))).toBe(true);
  act(() => stages[1].focus());
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toContain('Количество0');
  expect(tooltip.textContent).toContain('От первого—');
  expect(tooltip.textContent).toContain('От предыдущего—');
  expect(tooltip.textContent).toContain('Потеря0');
});
