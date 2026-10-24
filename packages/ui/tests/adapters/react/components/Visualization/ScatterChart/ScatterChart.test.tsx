import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import * as ui from '@dreadnought/ui/react';
import { tablePresentation } from '@dreadnought/ui';

afterEach(cleanup);
it('themes composed parts while keeping native circle targets and shared page state', () => {
  function Summary() {
    const { page } = ui.useScatterChart();
    return <button onClick={() => page.change(2)}>Page {page.page}</button>;
  }
  const view = render(
    <ui.ScatterChart
      label="Parts"
      width={400}
      height={320}
      xDomain={[0, 10]}
      yDomain={[0, 10]}
      pageSize={1}
      series={[
        {
          id: 'a',
          label: 'A',
          data: [
            { id: 'one', label: 'One', x: 1, y: 2 },
            { id: 'two', label: 'Two', x: 3, y: 4 },
          ],
        },
      ]}
    >
      <Summary />
      <ui.ScatterChart.Legend />
      <ui.ScatterChart.Plot>{({ defaultContent }) => <g>{defaultContent}</g>}</ui.ScatterChart.Plot>
      <ui.ScatterChart.Table />
      <ui.ScatterChart.Pagination />
      <ui.ScatterChart.Empty />
    </ui.ScatterChart>,
  );
  const target = screen.getAllByRole('img')[0];
  expect(target.tagName.toLowerCase()).toBe('circle');
  expect(target.style.fillOpacity).toBe('0');
  expect(
    view.container.querySelector('[data-ui="scatter-point-drawing"] circle')?.getAttribute('class'),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Page 1' }));
  expect(screen.getByRole('button', { name: 'Page 2' })).toBeTruthy();
  expect(screen.getByRole('table').textContent).toContain('Two');
  expect(screen.getByRole('table').className).toContain(tablePresentation.root);
});
it('keeps series colors distinct and stable and styles the table and tooltip', () => {
  expect(ui).toHaveProperty('ScatterChart');
  const series = ['direct', 'search', 'social', 'email', 'design', 'testing'].map((id) => ({
    id,
    label: id,
    data: [{ id: 'one', label: id, x: 1, y: 2 }],
  }));
  const props = {
    series,
    label: 'Colors',
    width: 400,
    height: 320,
    xDomain: [0, 10] as const,
    yDomain: [0, 10] as const,
  };
  const view = render(
    <ui.ScatterChart {...props} slotProps={{ point: () => ({ className: 'custom' }) }} />,
  );
  const colors = () => screen.getAllByRole('img').map((node) => node.getAttribute('class'));
  const original = colors();
  expect(new Set(original).size).toBe(6);
  expect(original.every((value) => value?.includes('custom'))).toBe(true);
  expect(screen.getByRole('table').className).toContain(tablePresentation.root);
  fireEvent.focus(screen.getAllByRole('img')[0]);
  expect(screen.getByRole('tooltip').querySelector('[data-ui="mark"]')?.className).toBeTruthy();
  view.rerender(
    <ui.ScatterChart
      {...props}
      series={[...series].reverse()}
      slotProps={{ point: () => ({ className: 'custom' }) }}
    />,
  );
  expect(colors()).toEqual([...original].reverse());
});
