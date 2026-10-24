import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import * as adapters from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('themes stages and tooltip while preserving consumer slots and unstyled adapter', () => {
  const props = { label: 'Воронка', data: [{ id: 'a', label: 'A', value: 1 }] };
  render(
    <>
      <ui.FunnelChart {...props} slotProps={{ stage: () => ({ className: 'custom-stage' }) }} />
      <adapters.FunnelChartAdapter {...props} />
    </>,
  );
  const stages = screen.getAllByRole('img');
  expect(stages[0].className).toContain('custom-stage');
  expect(stages[0].className.split(' ').length).toBeGreaterThan(1);
  expect(stages[1].className).toBe('');
  act(() => stages[0].focus());
  expect(screen.getByRole('tooltip').className).not.toBe('');
});

it('themes composed stages and shares full-process conversions with custom controls', () => {
  function Controls() {
    const { layout, page } = ui.useFunnelChart();
    return (
      <button onClick={() => page.change(2)}>
        Stages {layout.stages.length}, page {page.page}
      </button>
    );
  }
  render(
    <ui.FunnelChart
      label="Воронка"
      data={[
        { id: 'a', label: 'A', value: 100 },
        { id: 'b', label: 'B', value: 40 },
      ]}
      pageSize={1}
    >
      <Controls />
      <ui.FunnelChart.Plot>{({ defaultContent }) => defaultContent}</ui.FunnelChart.Plot>
      <ui.FunnelChart.Table />
      <ui.FunnelChart.Pagination />
      <ui.FunnelChart.Empty />
    </ui.FunnelChart>,
  );
  const stage = screen.getByRole('img');
  expect(stage.className).toBeTruthy();
  act(() => stage.focus());
  expect(screen.getByRole('tooltip').className).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Stages 2, page 1' }));
  expect(screen.getByRole('img').getAttribute('aria-label')).toBe('B: 40');
  expect(
    within(screen.getByRole('table')).getByRole('row', { name: /B 40 40% 40% 60/ }),
  ).toBeTruthy();
});
