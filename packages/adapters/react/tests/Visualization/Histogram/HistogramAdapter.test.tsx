import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

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
