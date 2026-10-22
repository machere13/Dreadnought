import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import * as ui from '@dreadnought/ui/react';
import { tablePresentation } from '@dreadnought/ui';

afterEach(cleanup);
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
