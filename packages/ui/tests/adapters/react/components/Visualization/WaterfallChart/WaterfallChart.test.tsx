import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import * as adapters from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('applies theme without styling the unstyled adapter', () => {
  const data = [{ id: 'a', label: 'Рост', kind: 'change', value: 10 }] as const;
  const { container } = render(
    <>
      <ui.WaterfallChart data={data} label="UI" className="custom" />
      <adapters.WaterfallChartAdapter data={data} label="Adapter" />
    </>,
  );
  const figures = container.querySelectorAll('figure');
  expect(figures[0].className).toContain('custom');
  expect(figures[0].querySelector('[data-ui="waterfall-step"]')?.className).toBeTruthy();
  expect(figures[1].className).toBe('');
  expect(figures[1].querySelector('[data-ui="waterfall-step"]')?.className).toBe('');
});

it('themes composed drawing while sharing full totals and pages with custom controls', () => {
  function Controls() {
    const { layout, page } = ui.useWaterfallChart();
    return (
      <button onClick={() => page.change(2)}>
        Steps {layout.steps.length}, page {page.page}
      </button>
    );
  }
  render(
    <ui.WaterfallChart
      label="Бюджет"
      data={[
        { id: 'a', label: 'Начало', kind: 'start', value: 100 },
        { id: 'b', label: 'Расход', kind: 'change', value: -25 },
        { id: 'c', label: 'Итог', kind: 'total' },
      ]}
      pageSize={2}
    >
      <Controls />
      <ui.WaterfallChart.Plot>
        {({ step, defaultContent }) => <span data-tone={step.tone}>{defaultContent}</span>}
      </ui.WaterfallChart.Plot>
      <ui.WaterfallChart.Table />
      <ui.WaterfallChart.Pagination />
      <ui.WaterfallChart.Empty />
    </ui.WaterfallChart>,
  );
  const first = screen.getByRole('img', { name: 'Начало: 100' });
  expect(first.className).toBeTruthy();
  act(() => first.focus());
  expect(screen.getByRole('tooltip').className).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Steps 3, page 1' }));
  expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Итог: 75');
  expect(
    within(screen.getByRole('table')).getByRole('row', { name: 'Итог Итог 75 75 75' }),
  ).toBeTruthy();
});
