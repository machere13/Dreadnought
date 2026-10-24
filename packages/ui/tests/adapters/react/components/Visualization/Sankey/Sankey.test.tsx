import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import * as adapters from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('themes the public component while preserving consumer classes and the unstyled adapter', () => {
  const nodes = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ];
  const links = [{ id: 'ab', source: 'a', target: 'b', value: 5 }];
  const { container } = render(
    <>
      <ui.Sankey
        nodes={nodes}
        links={links}
        label="UI"
        className="custom"
        slotProps={{ item: () => ({ className: 'custom-item' }) }}
      />
      <adapters.SankeyAdapter nodes={nodes} links={links} label="Adapter" />
    </>,
  );
  const figures = container.querySelectorAll('figure');
  expect(figures[0].className).toContain('custom');
  const item = figures[0].querySelector('[data-ui="sankey-item"]');
  expect(item?.className).toContain('custom-item');
  expect(item?.className).not.toBe('custom-item');
  expect(figures[1].className).toBe('');
  expect(figures[1].querySelector('[data-ui="sankey-item"]')?.className).toBe('');
});

it('themes custom nodes and flows while retaining protected hit areas and table-only pagination', () => {
  function Controls() {
    const { layout, page } = ui.useSankey();
    return (
      <button onClick={() => page.change(2)}>
        Links {layout.links.length}, page {page.page}
      </button>
    );
  }
  render(
    <ui.Sankey
      label="Переходы"
      nodes={[
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ]}
      links={[
        { id: 'ab', source: 'a', target: 'b', value: 60 },
        { id: 'ac', source: 'a', target: 'c', value: 40 },
      ]}
      pageSize={1}
    >
      <Controls />
      <ui.Sankey.Plot>{({ defaultContent }) => defaultContent}</ui.Sankey.Plot>
      <ui.Sankey.Table />
      <ui.Sankey.Pagination />
      <ui.Sankey.Empty />
    </ui.Sankey>,
  );
  const first = screen.getByRole('img', { name: 'A: 100' });
  expect(first.className).toBeTruthy();
  expect(first.querySelector<HTMLElement>('[data-ui="sankey-item-hit"]')?.style.opacity).toBe('0');
  act(() => first.focus());
  expect(screen.getByRole('tooltip').className).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Links 2, page 1' }));
  expect(screen.getAllByRole('img')).toHaveLength(5);
  expect(
    within(screen.getByRole('table', { name: 'Переходы: Данные' })).getByRole('row', {
      name: 'A C 40',
    }),
  ).toBeTruthy();
});
