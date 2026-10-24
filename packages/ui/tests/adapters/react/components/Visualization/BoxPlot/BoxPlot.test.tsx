import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import { BoxPlotAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('adds themed slots without styling the adapter or dropping consumer props', () => {
  const props = { label: 'Данные', data: [{ id: 'a', label: 'A', values: [1, 2, 3] }] };
  const { container } = render(
    <>
      <ui.BoxPlot {...props} slotProps={{ group: () => ({ className: 'custom-group' }) }} />
      <BoxPlotAdapter {...props} />
    </>,
  );
  const groups = screen.getAllByRole('img');
  expect(groups[0].className).toContain('custom-group');
  expect(groups[0].className.split(' ').length).toBeGreaterThan(1);
  expect(groups[1].className).toBe('');
  act(() => groups[0].focus());
  expect(screen.getByRole('tooltip').className).not.toBe('');
  expect(container.querySelector('[data-ui="mark"]')?.className).not.toBe('');
});

it('themes custom group content while sharing pages with controls, axis and table', () => {
  function Controls() {
    const { layout, page } = ui.useBoxPlot();
    return (
      <button onClick={() => page.change(2)}>
        Groups {layout.groups.length}, page {page.page}
      </button>
    );
  }
  render(
    <ui.BoxPlot
      label="Выборки"
      data={[
        { id: 'a', label: 'A', values: [1, 2, 3] },
        { id: 'b', label: 'B', values: [4, 5, 6] },
      ]}
      pageSize={1}
    >
      <Controls />
      <ui.BoxPlot.Axis />
      <ui.BoxPlot.Plot>
        {({ group, defaultContent }) => <span data-count={group.count}>{defaultContent}</span>}
      </ui.BoxPlot.Plot>
      <ui.BoxPlot.Table />
      <ui.BoxPlot.Pagination />
      <ui.BoxPlot.Empty />
    </ui.BoxPlot>,
  );
  const group = screen.getByRole('img');
  expect(group.className).toBeTruthy();
  expect(group.querySelector('[data-count="3"]')).toBeTruthy();
  act(() => group.focus());
  expect(screen.getByRole('tooltip').className).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Groups 2, page 1' }));
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('B:');
  expect(screen.getByRole('table', { name: 'Выборки: Статистика' }).className).toBeTruthy();
});
