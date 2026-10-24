import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import { tablePresentation } from '@dreadnought/ui';

afterEach(cleanup);
it('themes custom cells, tooltip and composed table controls from one context', () => {
  function Controls() {
    const { page } = ui.useHeatmap();
    return <button onClick={() => page.change(2)}>Next</button>;
  }
  render(
    <ui.Heatmap
      label="Composed"
      columns={[{ id: 'x', label: 'X' }]}
      rows={[
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ]}
      data={[
        { column: 'x', row: 'a', value: 0 },
        { column: 'x', row: 'b', value: 10 },
      ]}
      pageSize={1}
    >
      <Controls />
      <ui.Heatmap.Legend />
      <ui.Heatmap.Plot tooltipContent={({ defaultContent }) => <div>Custom{defaultContent}</div>}>
        {({ defaultContent }) => <strong>{defaultContent}</strong>}
      </ui.Heatmap.Plot>
      <ui.Heatmap.Table />
      <ui.Heatmap.Pagination />
      <ui.Heatmap.Empty />
    </ui.Heatmap>,
  );
  const [first, last] = screen.getAllByRole('img');
  expect(first.className).toBeTruthy();
  expect(first.style.getPropertyValue('--heatmap-cell-bg')).not.toBe(
    last.style.getPropertyValue('--heatmap-cell-bg'),
  );
  fireEvent.focus(first);
  expect(screen.getByRole('tooltip').className).toBeTruthy();
  expect(screen.getByRole('tooltip').textContent).toContain('Custom');
  fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
  expect(screen.getByRole('table', { name: 'Composed: Все данные' }).textContent).toContain('BX10');
  expect(screen.getByRole('table', { name: 'Composed: Все данные' }).className).toContain(
    tablePresentation.root,
  );
  expect(screen.getAllByRole('img')).toHaveLength(2);
});
it('styles values and the matching tooltip marker without overriding consumer slots', () => {
  expect(ui).toHaveProperty('Heatmap');
  const props = {
    label: 'Changes',
    columns: [{ id: 'x', label: 'X' }],
    rows: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ],
    data: [
      { column: 'x', row: 'a', value: -10 },
      { column: 'x', row: 'b', value: 0 },
    ],
    domain: [-10, 10] as const,
  };
  const view = render(
    <ui.Heatmap
      {...props}
      colorScale="diverging"
      slotProps={{ cell: () => ({ className: 'custom', style: { borderRadius: 7 } }) }}
    />,
  );
  const [low, middle, missing] = screen.getAllByRole('img');
  expect(low.className).toContain('custom');
  expect(low.style.borderRadius).toBe('7px');
  expect(low.style.getPropertyValue('--heatmap-cell-bg')).not.toBe(
    middle.style.getPropertyValue('--heatmap-cell-bg'),
  );
  expect(missing.style.getPropertyValue('--heatmap-cell-bg')).toBe(
    'var(--dreadnought-heatmap-missing-bg)',
  );
  fireEvent.focus(low);
  const mark = screen.getByRole('tooltip').querySelector<HTMLElement>('[data-ui="mark"]')!;
  expect(mark.style.getPropertyValue('--dreadnought-mark-color')).toBe(
    low.style.getPropertyValue('--heatmap-cell-bg'),
  );
  expect(screen.getByRole('table', { name: 'Changes: Все данные' }).className).toContain(
    tablePresentation.root,
  );
  view.rerender(<ui.Heatmap {...props} colorScale="sequential" showValues={false} />);
  expect(screen.getAllByRole('img')[0].textContent).toBe('');
  expect(screen.getAllByRole('img')[0].getAttribute('aria-label')).toContain('-10');
});
