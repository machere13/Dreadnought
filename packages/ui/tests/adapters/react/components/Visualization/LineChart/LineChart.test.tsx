import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import { LineChartAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('themes composed parts and exposes their shared context', () => {
  function Summary() {
    const { visible } = ui.useLineChart();
    return <p>Visible {visible.length}</p>;
  }
  const { container } = render(
    <ui.LineChart {...props}>
      <Summary />
      <ui.LineChart.Legend />
      <ui.LineChart.Plot />
      <ui.LineChart.RangeControls />
      <ui.LineChart.Table />
      <ui.LineChart.Pagination />
      <ui.LineChart.Empty />
    </ui.LineChart>,
  );
  expect(screen.getByText('Visible 1')).toBeTruthy();
  expect(container.querySelector('[data-ui="line-series"]')?.getAttribute('class')).toBeTruthy();
  expect(container.querySelector('table')?.className).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'A' }));
  expect(screen.getByText('Visible 0')).toBeTruthy();
  expect(container.querySelector('[data-ui="line-series"]')).toBeNull();
});
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
