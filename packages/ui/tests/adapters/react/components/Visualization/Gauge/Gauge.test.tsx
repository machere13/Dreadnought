import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import * as adapters from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('adds themed slots and preserves custom classes without styling the adapter', () => {
  const { container } = render(
    <>
      <ui.Gauge
        value={50}
        label="UI"
        className="custom"
        slotProps={{ plot: { className: 'custom-plot' } }}
      />
      <adapters.GaugeAdapter value={50} label="Adapter" />
    </>,
  );
  const figures = container.querySelectorAll('figure');
  expect(figures[0].className).toContain('custom');
  const plot = figures[0].querySelector('[data-ui="gauge-plot"]');
  expect(plot?.className).toContain('custom-plot');
  expect(plot?.className).not.toBe('custom-plot');
  expect(figures[1].className).toBe('');
  expect(figures[1].querySelector('[data-ui="gauge-plot"]')?.className).toBe('');
});
