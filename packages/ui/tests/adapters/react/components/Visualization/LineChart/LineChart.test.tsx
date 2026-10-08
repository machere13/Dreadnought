import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import { LineChartAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);
const props = {
  label: 'Линии',
  width: 500,
  height: 300,
  xDomain: [0, 10] as const,
  yDomain: [0, 100] as const,
  series: [
    {
      id: 'a',
      label: 'A',
      data: [
        { x: 0, y: 0 },
        { x: 10, y: 80 },
      ],
    },
  ],
};
it('applies scoped presentation to lines and tooltip marks without styling the adapter', () => {
  expect(ui).toHaveProperty('LineChart');
  const { container } = render(
    <>
      <ui.LineChart {...props} />
      <LineChartAdapter {...props} label="Plain" />
    </>,
  );
  const figures = container.querySelectorAll('figure');
  expect(figures[0].querySelector('[data-ui="line-series"]')?.getAttribute('class')).toBeTruthy();
  expect(figures[1].querySelector('[data-ui="line-series"]')?.getAttribute('class')).toBeNull();
  fireEvent.focus(screen.getAllByRole('img', { name: 'A, 0: 0' })[0]);
  expect(
    screen.getByRole('tooltip').querySelector('[data-ui="mark"]')?.getAttribute('class'),
  ).toBeTruthy();
});
