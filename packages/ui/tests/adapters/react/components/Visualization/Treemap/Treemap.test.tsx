import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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

it('themes composed tiles and Breadcrumb while custom controls retain drill and return focus', () => {
  function Controls() {
    const { navigate } = ui.useTreemap();
    return <button onClick={() => navigate('r')}>Root</button>;
  }
  render(
    <ui.Treemap
      label="Расходы"
      data={{
        id: 'r',
        label: 'Все',
        children: [{ id: 'g', label: 'Группа', children: [{ id: 'a', label: 'A', value: 10 }] }],
      }}
    >
      <Controls />
      <ui.Treemap.Breadcrumb />
      <ui.Treemap.Location />
      <ui.Treemap.Plot>
        {({ item, defaultContent }) => <span data-value={item.value}>{defaultContent}</span>}
      </ui.Treemap.Plot>
      <ui.Treemap.Table />
      <ui.Treemap.Pagination />
      <ui.Treemap.Empty />
    </ui.Treemap>,
  );
  const group = screen.getByRole('button', { name: 'Группа: 10' });
  expect(group.className).toBeTruthy();
  expect(group.querySelector('[data-value="10"]')).toBeTruthy();
  expect(screen.getByRole('navigation', { name: 'Путь в Treemap' }).className).toBeTruthy();
  fireEvent.click(group);
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'A: 10' }));
  expect(screen.getByRole('tooltip').className).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Root', exact: true }));
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Группа: 10' }));
});
