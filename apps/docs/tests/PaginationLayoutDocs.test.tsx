import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { paginationDoc } from '../src/content/components/Navigation/Pagination/PaginationDoc.tsx';
import { layoutDoc } from '../src/content/components/Layout/Layout/LayoutDoc.tsx';

afterEach(cleanup);

it.each([
  ['Pagination', paginationDoc, 'Navigation'],
  ['Layout', layoutDoc, 'Layout'],
] as const)('pairs each %s example with its complete source', (_name, doc, folder) => {
  expect(doc.examples).toHaveLength(3);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components', folder, doc.title, `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('changes the visible records through page, jump and size controls', () => {
  render(paginationDoc.examples![0].demo);
  const list = screen.getByRole('list', { name: 'Записи текущей страницы' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(5);
  fireEvent.click(screen.getByRole('button', { name: 'Страница 3' }));
  expect(within(list).getByText('Запись 11')).toBeTruthy();
  expect(within(list).queryByText('Запись 1')).toBeNull();
  const jump = screen.getByRole('textbox', { name: 'Перейти на страницу' });
  fireEvent.change(jump, { target: { value: '24' } });
  fireEvent.keyDown(jump, { key: 'Enter' });
  expect(within(list).getByText('Запись 120')).toBeTruthy();
  fireEvent.click(screen.getByRole('combobox', { name: 'Строк на странице' }));
  fireEvent.click(screen.getByRole('option', { name: '10 / стр.' }));
  expect(within(list).getAllByRole('listitem')).toHaveLength(10);
  expect(within(list).getByText('Запись 1')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Страница 1' }).getAttribute('aria-current')).toBe(
    'page',
  );
});

it('shows a partial last page in simple mode and disables moving beyond it', () => {
  render(paginationDoc.examples![1].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
  const list = screen.getByRole('list', { name: 'Записи простого режима' });
  expect(
    within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent),
  ).toEqual(['Запись 11', 'Запись 12']);
  expect(screen.getByRole('button', { name: 'Следующая страница' })).toHaveProperty(
    'disabled',
    true,
  );
});

it('uses Table pagination to switch actual rows', () => {
  render(paginationDoc.examples![2].demo);
  expect(screen.getByRole('table').getAttribute('data-bordered')).toBe('true');
  expect(screen.getByRole('cell', { name: 'Запись 1' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
  expect(screen.queryByRole('cell', { name: 'Запись 1' })).toBeNull();
  expect(screen.getByRole('cell', { name: 'Запись 6' })).toBeTruthy();
});

it.each([
  [0, true],
  [1, false],
] as const)('places footer %s in the demonstrated container', (index, includesSidebar) => {
  render(layoutDoc.examples![index].demo);
  const footer = screen.getByRole('contentinfo');
  const sidebar = screen.getByRole('complementary');
  expect(footer.parentElement!.contains(sidebar)).toBe(includesSidebar);
});

it('accepts external and internal controlled Sidebar changes', () => {
  render(layoutDoc.examples![2].demo);
  const sidebar = screen.getByRole('complementary', { name: 'Управляемая боковая область' });
  expect(sidebar.getAttribute('data-collapsed')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Развернуть панель извне' }));
  expect(sidebar.getAttribute('data-collapsed')).toBe('false');
  expect(screen.getByRole('status').textContent).toBe('Панель развёрнута');
  fireEvent.click(within(sidebar).getByRole('button', { name: 'Свернуть управляемое меню' }));
  expect(sidebar.getAttribute('data-collapsed')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('Панель свёрнута');
});
