import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import * as adapters from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('themes composed drawing and legend while retaining the keyboard tooltip', () => {
  render(
    <ui.Gauge label="Composed" value={70} thresholds={[{ id: 'all', label: 'Все', to: 100 }]}>
      <ui.Gauge.Legend>{({ defaultContent }) => defaultContent}</ui.Gauge.Legend>
      <ui.Gauge.Plot tooltipContent={({ defaultContent }) => <div>Custom{defaultContent}</div>}>
        {({ defaultContent }) => defaultContent}
      </ui.Gauge.Plot>
    </ui.Gauge>,
  );
  const plot = screen.getByRole('img');
  expect(plot.className).toBeTruthy();
  expect(screen.getByRole('list').className).toBeTruthy();
  act(() => plot.focus());
  expect(screen.getByRole('tooltip').className).toBeTruthy();
  expect(screen.getByRole('tooltip').textContent).toContain('Custom');
  fireEvent.keyDown(plot, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});
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
