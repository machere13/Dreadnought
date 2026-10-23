import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
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
