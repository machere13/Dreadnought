import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

afterEach(cleanup);
const nodes = [
  { id: 'a', label: 'Посетители' },
  { id: 'b', label: 'Заказ' },
  { id: 'c', label: 'Выход' },
];
const links = [
  { id: 'ab', source: 'a', target: 'b', value: 60 },
  { id: 'ac', source: 'a', target: 'c', value: 40 },
];

it('exposes node totals, exact link values and keyboard tooltips', () => {
  render(<adapters.SankeyAdapter nodes={nodes} links={links} label="Переходы" />);
  const first = screen.getByRole('img', { name: 'Посетители: 100' });
  act(() => first.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Исходящие100');
  fireEvent.keyDown(first, { key: 'End' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'Посетители → Выход: 40' }));
  expect(screen.getByRole('tooltip').textContent).toContain('40');
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Переходы: Данные' });
  expect(within(table).getByRole('row', { name: 'Посетители Заказ 60' })).toBeTruthy();
});

it('paginates the table without dropping graph links and clears stale tooltips', () => {
  const { rerender } = render(
    <adapters.SankeyAdapter nodes={nodes} links={links} label="Переходы" pageSize={1} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.getAllByRole('img')).toHaveLength(5);
  expect(
    within(screen.getByRole('table')).getByRole('row', { name: 'Посетители Выход 40' }),
  ).toBeTruthy();
  act(() => screen.getByRole('img', { name: 'Заказ: 60' }).focus());
  rerender(<adapters.SankeyAdapter nodes={[]} links={[]} label="Переходы" />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(screen.getByText('Нет данных')).toBeTruthy();
});

it('honors consumer cancellation and prevents stale hover from replacing focused tooltip', () => {
  vi.useFakeTimers();
  try {
    const { rerender } = render(
      <adapters.SankeyAdapter nodes={nodes} links={links} label="Переходы" />,
    );
    fireEvent.pointerEnter(screen.getByRole('img', { name: 'Посетители: 100' }), {
      pointerType: 'mouse',
    });
    const second = screen.getByRole('img', { name: 'Заказ: 60' });
    act(() => second.focus());
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(screen.getByRole('tooltip').textContent).toContain('Заказ');
    rerender(
      <adapters.SankeyAdapter
        nodes={nodes}
        links={links}
        label="Переходы"
        slotProps={{ item: () => ({ onKeyDown: (e) => e.preventDefault() }) }}
      />,
    );
    fireEvent.keyDown(second, { key: 'End' });
    expect(document.activeElement).toBe(second);
  } finally {
    vi.useRealTimers();
  }
});
