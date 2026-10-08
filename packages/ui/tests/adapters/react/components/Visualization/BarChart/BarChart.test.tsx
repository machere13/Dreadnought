import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import * as presentation from '@dreadnought/ui';
import { BarChartAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('exports framework-neutral BarChart presentation without the React component', () => {
  expect(presentation).toHaveProperty('barChartPresentation');
  expect(presentation).toHaveProperty('getBarSeriesClass');
  expect(presentation).not.toHaveProperty('BarChart');
});
const props = {
  label: 'Столбцы',
  width: 500,
  height: 300,
  domain: [-10, 20] as const,
  categories: [{ id: 'one', label: 'One' }],
  series: [{ id: 'a', label: 'A', values: { one: 10 } }],
};
it('styles bars, preserves consumer slots and leaves the adapter unstyled', () => {
  expect(ui).toHaveProperty('BarChart');
  const { container } = render(
    <>
      <ui.BarChart {...props} slotProps={{ bar: () => ({ className: 'custom-bar' }) }} />
      <BarChartAdapter {...props} label="Plain" />
    </>,
  );
  const figures = container.querySelectorAll('figure');
  expect(figures[0].querySelector('[data-ui="bar-item"]')?.getAttribute('class')).toContain(
    'custom-bar',
  );
  expect(figures[1].querySelector('[data-ui="bar-item"]')?.getAttribute('class')).toBeNull();
  fireEvent.focus(screen.getAllByRole('img', { name: 'A, One: 10' })[0]);
  expect(
    screen.getByRole('tooltip').querySelector('[data-ui="mark"]')?.getAttribute('class'),
  ).toBeTruthy();
});
