import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import { tablePresentation } from '@dreadnought/ui';

afterEach(cleanup);
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
