import { afterEach, expect, it } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
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
