import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Histogram } from '@dreadnought/ui/react';
import { HistogramAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('shares bar styling while keeping the adapter unstyled and caller slots intact', () => {
  const props = { label: 'Выборка', data: [1, 2], bins: 1, width: 500, height: 300 };
  const { container } = render(
    <>
      <Histogram {...props} slotProps={{ bar: () => ({ className: 'custom-bin' }) }} />
      <HistogramAdapter {...props} />
    </>,
  );
  const figures = container.querySelectorAll('figure');
  expect(figures[0].querySelector('[data-ui="bar-item"]')?.getAttribute('class')).toContain(
    'custom-bin',
  );
  expect(figures[1].querySelector('[data-ui="bar-item"]')?.getAttribute('class')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Наблюдения' })).toBeNull();
  fireEvent.focus(screen.getAllByRole('img')[0]);
  expect(
    screen.getByRole('tooltip').querySelector('[data-ui="mark"]')?.getAttribute('class'),
  ).toBeTruthy();
});
