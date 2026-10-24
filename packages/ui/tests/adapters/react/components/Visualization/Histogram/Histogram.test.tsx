import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Histogram, useHistogram } from '@dreadnought/ui/react';
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

it('themes composed bins and shares the exact histogram model with custom controls', () => {
  function Controls() {
    const { layout, page } = useHistogram();
    return (
      <button onClick={() => page.change(2)}>
        Total {layout.total}, page {page.page}
      </button>
    );
  }
  render(
    <Histogram
      label="Выборка"
      data={[0, 1, 2, 3, 4]}
      bins={2}
      width={500}
      height={300}
      pageSize={1}
    >
      <Controls />
      <Histogram.Plot>
        {({ bin, defaultContent }) => <g data-count={bin.count}>{defaultContent}</g>}
      </Histogram.Plot>
      <Histogram.Table />
      <Histogram.Pagination />
      <Histogram.Empty />
    </Histogram>,
  );
  const bins = screen.getAllByRole('img');
  expect(bins[0].getAttribute('class')).toBeTruthy();
  expect(bins[0].querySelector('[data-count="2"]')).toBeTruthy();
  act(() => bins[0].focus());
  expect(screen.getByRole('tooltip').className).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Total 5, page 1' }));
  expect(screen.getByRole('button', { name: 'Total 5, page 2' })).toBeTruthy();
  expect(
    within(screen.getByRole('table', { name: 'Выборка: Данные' })).getByText('3 (60%)'),
  ).toBeTruthy();
  expect(screen.getAllByRole('img')).toHaveLength(2);
});
