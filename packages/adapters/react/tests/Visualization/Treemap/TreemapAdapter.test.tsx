import { afterEach, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/Visualization/Treemap/index.ts';

afterEach(cleanup);
const data = {
  id: 'all',
  label: 'Бюджет',
  children: [
    {
      id: 'dev',
      label: 'Разработка',
      children: [
        { id: 'web', label: 'Web', value: 30 },
        { id: 'api', label: 'API', value: 30 },
      ],
    },
    { id: 'design', label: 'Дизайн', value: 40 },
    { id: 'zero', label: 'Резерв', children: [] },
  ],
};

it('composes tile content, breadcrumbs and controls while retaining drill focus and shares', () => {
  expect(adapters.TreemapAdapter.Plot).toBeTypeOf('function');
  const changed = vi.fn();
  const ref = createRef<HTMLElement>();
  function Controls() {
    const { layout, page, navigate } = adapters.useTreemap();
    return (
      <>
        <p>
          Root {layout.root.id}, page {page.page}
        </p>
        <button onClick={() => page.change(2)}>Next rows</button>
        <button onClick={() => navigate('all')}>Root</button>
        <button onClick={() => navigate('unknown')}>Unknown</button>
      </>
    );
  }
  render(
    <adapters.TreemapAdapter
      data={data}
      label="Расходы"
      pageSize={1}
      onRootChange={changed}
      slotProps={{ tile: (item) => (item.id === 'dev' ? { ref } : {}) }}
    >
      <Controls />
      <adapters.TreemapAdapter.Breadcrumb />
      <adapters.TreemapAdapter.Location />
      <adapters.TreemapAdapter.Plot
        tooltipContent={({ item, defaultContent }) => (
          <div>
            {defaultContent}
            <p>Item {item.id}</p>
          </div>
        )}
      >
        {({ item, defaultContent }) => <span data-value={item.value}>{defaultContent}</span>}
      </adapters.TreemapAdapter.Plot>
      <adapters.TreemapAdapter.Table />
      <adapters.TreemapAdapter.Pagination />
      <adapters.TreemapAdapter.Empty />
    </adapters.TreemapAdapter>,
  );
  const group = screen.getByRole('button', { name: 'Разработка: 60' });
  expect(ref.current).toBe(group);
  expect(group.querySelector('[data-value="60"]')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Unknown', exact: true }));
  expect(changed).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Next rows' }));
  expect(screen.getByText('Root all, page 2')).toBeTruthy();
  expect(within(screen.getByRole('table')).getByText('Дизайн')).toBeTruthy();
  fireEvent.click(group);
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'Web: 30' }));
  expect(screen.getByText('Root dev, page 1')).toBeTruthy();
  expect(screen.getByRole('tooltip').textContent).toContain('Доля от всего30%');
  expect(screen.getByRole('tooltip').textContent).toContain('Item web');
  expect(ref.current).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Root', exact: true }));
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Разработка: 60' }));
  expect(changed.mock.calls).toEqual([['dev'], ['all']]);
});

it('supports nullable tile tooltips, explicit composition and scoped hooks', () => {
  expect(adapters.useTreemap).toBeTypeOf('function');
  const { rerender } = render(
    <adapters.TreemapAdapter data={data} label="Расходы">
      <adapters.TreemapAdapter.Plot tooltipContent={() => null}>
        {({ defaultContent }) => defaultContent}
      </adapters.TreemapAdapter.Plot>
    </adapters.TreemapAdapter>,
  );
  act(() => screen.getByRole('img', { name: 'Дизайн: 40' }).focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  rerender(
    <adapters.TreemapAdapter data={data} label="Расходы">
      {null}
    </adapters.TreemapAdapter>,
  );
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByRole('table')).toBeNull();
  function Outside() {
    adapters.useTreemap();
    return null;
  }
  expect(() => render(<Outside />)).toThrow(/Treemap/);
});

it('keeps focus recoverable when plot and location are replaced, and resets data without callbacks', () => {
  const changed = vi.fn();
  const ref = createRef<HTMLElement>();
  const renderChart = (source: typeof data) => (
    <adapters.TreemapAdapter data={source} label="Расходы" onRootChange={changed} ref={ref}>
      <adapters.TreemapAdapter.Breadcrumb />
      <adapters.TreemapAdapter.Table />
      <adapters.TreemapAdapter.Pagination />
      <adapters.TreemapAdapter.Empty />
    </adapters.TreemapAdapter>
  );
  const { rerender, unmount } = render(renderChart(data));
  fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: 'Резерв' }));
  expect(document.activeElement).toBe(ref.current);
  expect(screen.getByText('Нет положительных значений')).toBeTruthy();
  expect(changed).toHaveBeenCalledExactlyOnceWith('zero');
  rerender(renderChart({ ...data }));
  expect(screen.getByRole('table', { name: 'Расходы: Бюджет' })).toBeTruthy();
  expect(changed).toHaveBeenCalledTimes(1);
  unmount();
  expect(ref.current).toBeNull();
});

it('drills down and returns via Breadcrumb with surviving focus and exact tooltip values', () => {
  render(<adapters.TreemapAdapter data={data} label="Расходы" />);
  const group = screen.getByRole('button', { name: 'Разработка: 60' });
  act(() => group.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Доля в группе60%');
  fireEvent.click(group);
  const web = screen.getByRole('img', { name: 'Web: 30' });
  expect(document.activeElement).toBe(web);
  expect(screen.getByRole('tooltip').textContent).toContain('Доля в группе50%');
  expect(screen.getByRole('tooltip').textContent).toContain('Доля от всего30%');
  const crumbs = screen.getByRole('navigation', { name: 'Путь в Treemap' });
  expect(crumbs.getAttribute('data-ui')).toBe('breadcrumb');
  fireEvent.click(within(crumbs).getByRole('button', { name: 'Бюджет' }));
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Разработка: 60' }));
});

it('navigates tiles with arrows and keeps zero groups accessible from the table', () => {
  render(<adapters.TreemapAdapter data={data} label="Расходы" />);
  const group = screen.getByRole('button', { name: 'Разработка: 60' });
  act(() => group.focus());
  fireEvent.keyDown(group, { key: 'ArrowRight' });
  const leaf = screen.getByRole('img', { name: 'Дизайн: 40' });
  expect(document.activeElement).toBe(leaf);
  fireEvent.keyDown(leaf, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Расходы: Бюджет' });
  fireEvent.click(within(table).getByRole('button', { name: 'Резерв' }));
  expect(screen.getByText('Нет положительных значений')).toBeTruthy();
  expect(document.activeElement?.getAttribute('data-ui')).toBe('treemap-location');
});

it('resets navigation and removes stale tooltips when data is replaced', () => {
  const { rerender } = render(<adapters.TreemapAdapter data={data} label="Расходы" />);
  fireEvent.click(screen.getByRole('button', { name: 'Разработка: 60' }));
  rerender(
    <adapters.TreemapAdapter data={{ id: 'new', label: 'Новый', children: [] }} label="Расходы" />,
  );
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(screen.getByRole('navigation', { name: 'Путь в Treemap' }).textContent).toBe('Новый');
});

it('paginates the table without changing tiles or percentages', () => {
  const rows = Array.from({ length: 5 }, (_, index) => ({
    id: `leaf-${index}`,
    label: `Проект ${index + 1}`,
    value: 10,
  }));
  const { container } = render(
    <adapters.TreemapAdapter
      data={{ id: 'all', label: 'Все', children: rows }}
      label="Проекты"
      pageSize={2}
    />,
  );
  const tiles = [...container.querySelectorAll('[data-ui="treemap-tile"]')];
  const positions = tiles.map((tile) => tile.getAttribute('style'));
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  const table = screen.getByRole('table', { name: 'Проекты: Все' });
  expect(within(table).getByRole('rowheader', { name: 'Проект 3' })).toBeTruthy();
  expect(within(table).queryByRole('rowheader', { name: 'Проект 1' })).toBeNull();
  expect(tiles).toHaveLength(5);
  expect(
    [...container.querySelectorAll('[data-ui="treemap-tile"]')].map((tile) =>
      tile.getAttribute('style'),
    ),
  ).toEqual(positions);
  expect(within(table).getAllByRole('cell', { name: '20%' })).toHaveLength(4);
});

it('honors cancelled navigation and reports only user root changes', () => {
  const changed = vi.fn();
  const { rerender } = render(
    <adapters.TreemapAdapter
      data={data}
      label="Расходы"
      onRootChange={changed}
      slotProps={{ tile: () => ({ onClick: (event) => event.preventDefault() }) }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Разработка: 60' }));
  expect(changed).not.toHaveBeenCalled();
  const table = screen.getByRole('table', { name: 'Расходы: Бюджет' });
  fireEvent.click(within(table).getByRole('button', { name: 'Разработка' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith('dev');
  rerender(<adapters.TreemapAdapter data={{ ...data }} label="Расходы" onRootChange={changed} />);
  expect(changed).toHaveBeenCalledTimes(1);
});

it('ignores delayed hover after keyboard focus moves to a different tile', () => {
  vi.useFakeTimers();
  try {
    render(<adapters.TreemapAdapter data={data} label="Расходы" />);
    const group = screen.getByRole('button', { name: 'Разработка: 60' });
    fireEvent.pointerEnter(group, { pointerType: 'mouse' });
    act(() => screen.getByRole('img', { name: 'Дизайн: 40' }).focus());
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('tooltip').textContent).toContain('Дизайн');
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
  } finally {
    vi.useRealTimers();
  }
});
