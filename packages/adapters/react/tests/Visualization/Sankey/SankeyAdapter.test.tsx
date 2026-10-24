import { afterEach, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/Visualization/Sankey/index.ts';

afterEach(cleanup);
const nodes = [
  { id: 'a', label: 'Посетители' },
  { id: 'b', label: 'Заказ' },
  { id: 'c', label: 'Выход' },
];
const links = [
  { id: 'ab', source: 'a', target: 'b', value: 60 },
  { id: 'ac', source: 'a', target: 'c', value: 40 },
];

it('composes node and flow drawing with preserved hit targets, refs and shared table pages', () => {
  expect(adapters.SankeyAdapter.Plot).toBeTypeOf('function');
  const ref = createRef<HTMLSpanElement>();
  function Controls() {
    const { layout, page } = adapters.useSankey();
    return (
      <button onClick={() => page.change(2)}>
        Links {layout.links.length}, page {page.page}
      </button>
    );
  }
  const { unmount } = render(
    <adapters.SankeyAdapter
      nodes={nodes}
      links={links}
      label="Переходы"
      pageSize={1}
      slotProps={{ item: (item) => (item.kind === 'node' && item.id === 'a' ? { ref } : {}) }}
    >
      <Controls />
      <adapters.SankeyAdapter.Plot
        tooltipContent={({ item, defaultContent }) => (
          <div>
            {defaultContent}
            <p>Kind {item.kind}</p>
          </div>
        )}
      >
        {({ item, width, height, path }) => (
          <svg data-custom-kind={item.kind} width={width} height={height}>
            {item.kind === 'node' ? <rect width={width} height={height} /> : <path d={path} />}
          </svg>
        )}
      </adapters.SankeyAdapter.Plot>
      <adapters.SankeyAdapter.Table />
      <adapters.SankeyAdapter.Pagination />
      <adapters.SankeyAdapter.Empty />
    </adapters.SankeyAdapter>,
  );
  const first = screen.getByRole('img', { name: 'Посетители: 100' });
  expect(ref.current).toBe(first);
  expect(first.querySelector('[data-custom-kind="node"]')).toBeTruthy();
  const hit = first.querySelector<HTMLElement>('[data-ui="sankey-item-hit"]')!;
  expect(hit.style.opacity).toBe('0');
  expect(hit.querySelector('rect')?.style.pointerEvents).toBe('all');
  act(() => first.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Kind node');
  fireEvent.keyDown(first, { key: 'End' });
  const flow = screen.getByRole('img', { name: 'Посетители → Выход: 40' });
  expect(document.activeElement).toBe(flow);
  expect(flow.querySelector('[data-ui="sankey-item-hit"] path')?.getAttribute('style')).toContain(
    'pointer-events: stroke',
  );
  expect(screen.getByRole('tooltip').textContent).toContain('Kind link');
  fireEvent.click(screen.getByRole('button', { name: 'Links 2, page 1' }));
  expect(screen.getAllByRole('img')).toHaveLength(5);
  expect(
    within(screen.getByRole('table', { name: 'Переходы: Данные' })).getByRole('row', {
      name: 'Посетители Выход 40',
    }),
  ).toBeTruthy();
  unmount();
  expect(ref.current).toBeNull();
});

it('supports explicit composition, nullable tooltips and data reset with custom content', () => {
  expect(adapters.useSankey).toBeTypeOf('function');
  const chart = (source: typeof nodes) => (
    <adapters.SankeyAdapter nodes={source} links={links} label="Переходы">
      <adapters.SankeyAdapter.Plot
        tooltipContent={({ item, defaultContent }) =>
          item.kind === 'node' ? null : defaultContent
        }
      >
        {({ defaultContent }) => defaultContent}
      </adapters.SankeyAdapter.Plot>
    </adapters.SankeyAdapter>
  );
  const { rerender } = render(chart(nodes));
  act(() => screen.getByRole('img', { name: 'Посетители: 100' }).focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(document.activeElement!, { key: 'End' });
  expect(screen.getByRole('tooltip').textContent).toContain('Выход');
  rerender(chart([...nodes]));
  expect(screen.queryByRole('tooltip')).toBeNull();
  rerender(
    <adapters.SankeyAdapter nodes={nodes} links={links} label="Переходы">
      {null}
    </adapters.SankeyAdapter>,
  );
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByRole('table')).toBeNull();
  rerender(
    <adapters.SankeyAdapter nodes={[]} links={[]} label="Переходы">
      <adapters.SankeyAdapter.Empty />
    </adapters.SankeyAdapter>,
  );
  expect(screen.getByText('Нет данных')).toBeTruthy();
  function Outside() {
    adapters.useSankey();
    return null;
  }
  expect(() => render(<Outside />)).toThrow(/Sankey/);
});

it('exposes node totals, exact link values and keyboard tooltips', () => {
  render(<adapters.SankeyAdapter nodes={nodes} links={links} label="Переходы" />);
  const first = screen.getByRole('img', { name: 'Посетители: 100' });
  act(() => first.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Исходящие100');
  fireEvent.keyDown(first, { key: 'End' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'Посетители → Выход: 40' }));
  expect(screen.getByRole('tooltip').textContent).toContain('40');
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Переходы: Данные' });
  expect(within(table).getByRole('row', { name: 'Посетители Заказ 60' })).toBeTruthy();
});

it('paginates the table without dropping graph links and clears stale tooltips', () => {
  const { rerender } = render(
    <adapters.SankeyAdapter nodes={nodes} links={links} label="Переходы" pageSize={1} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.getAllByRole('img')).toHaveLength(5);
  expect(
    within(screen.getByRole('table')).getByRole('row', { name: 'Посетители Выход 40' }),
  ).toBeTruthy();
  act(() => screen.getByRole('img', { name: 'Заказ: 60' }).focus());
  rerender(<adapters.SankeyAdapter nodes={[]} links={[]} label="Переходы" />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(screen.getByText('Нет данных')).toBeTruthy();
});

it('honors consumer cancellation and prevents stale hover from replacing focused tooltip', () => {
  vi.useFakeTimers();
  try {
    const { rerender } = render(
      <adapters.SankeyAdapter nodes={nodes} links={links} label="Переходы" />,
    );
    fireEvent.pointerEnter(screen.getByRole('img', { name: 'Посетители: 100' }), {
      pointerType: 'mouse',
    });
    const second = screen.getByRole('img', { name: 'Заказ: 60' });
    act(() => second.focus());
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(screen.getByRole('tooltip').textContent).toContain('Заказ');
    rerender(
      <adapters.SankeyAdapter
        nodes={nodes}
        links={links}
        label="Переходы"
        slotProps={{ item: () => ({ onKeyDown: (e) => e.preventDefault() }) }}
      />,
    );
    fireEvent.keyDown(second, { key: 'End' });
    expect(document.activeElement).toBe(second);
  } finally {
    vi.useRealTimers();
  }
});
