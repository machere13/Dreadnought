import { afterEach, expect, it } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import * as adapters from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('themes tiles, Breadcrumb and tooltip without styling the unstyled adapter', () => {
  const data = { id: 'r', label: 'R', children: [{ id: 'a', label: 'A', value: 1 }] };
  render(
    <>
      <ui.Treemap
        data={data}
        label="Данные"
        slotProps={{ tile: () => ({ className: 'custom' }) }}
      />
      <adapters.TreemapAdapter data={data} label="Данные" />
    </>,
  );
  const tiles = screen.getAllByRole('img');
  expect(tiles[0].className).toContain('custom');
  expect(tiles[0].className.split(' ').length).toBeGreaterThan(1);
  expect(tiles[1].className).toBe('');
  expect(screen.getAllByRole('navigation')[0].className).not.toBe('');
  act(() => tiles[0].focus());
  expect(screen.getByRole('tooltip').className).not.toBe('');
});
