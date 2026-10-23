import { afterEach, expect, it } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
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
