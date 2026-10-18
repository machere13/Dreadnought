import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { DocsSearch } from '../src/features/search/DocsSearch.tsx';
import type { KnowledgeEntry } from '../src/data/knowledge/types.ts';

afterEach(cleanup);

const entries: KnowledgeEntry[] = [
  {
    id: 'catalog:input',
    sourceId: 'catalog:input',
    sourceKind: 'catalog',
    title: 'Input',
    url: '/components/input/',
    text: 'Input: поле для текста',
    code: [],
  },
  {
    id: 'catalog:textarea',
    sourceId: 'catalog:textarea',
    sourceKind: 'catalog',
    title: 'TextArea',
    url: '/components/textarea/',
    text: 'Input: многострочный текст',
    code: [],
  },
];

it('shows search results as named navigation links and restores regular navigation on clearing', async () => {
  const user = userEvent.setup();
  render(
    <DocsSearch knowledge={{ entries, loading: false, error: null, retry: vi.fn() }}>
      <nav aria-label="Обычная навигация">Начало</nav>
    </DocsSearch>,
  );
  const search = screen.getByRole('searchbox', { name: 'Поиск по документации' });
  await user.type(search, 'Input');
  const results = screen.getByRole('navigation', { name: 'Результаты поиска' });
  const links = within(results).getAllByRole('link');
  expect(links).toHaveLength(2);
  expect(links[0].getAttribute('href')).toBe('/components/input/');
  expect(within(results).getByRole('link', { name: 'Input', exact: true })).toBeTruthy();
  expect(within(results).getByRole('link', { name: 'TextArea', exact: true })).toBeTruthy();
  expect(screen.queryByRole('navigation', { name: 'Обычная навигация' })).toBeNull();
  await user.clear(search);
  expect(screen.getByRole('navigation', { name: 'Обычная навигация' })).toBeTruthy();
});

it('labels loading without displaying an empty result message', () => {
  render(
    <DocsSearch knowledge={{ entries: [], loading: true, error: null, retry: vi.fn() }}>
      Начало
    </DocsSearch>,
  );
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Input' } });
  expect(screen.getByRole('status', { name: 'Загрузка поиска…' })).toBeTruthy();
  expect(screen.queryByText('Ничего не найдено')).toBeNull();
});

it('keeps the search error and retry action available', async () => {
  const retry = vi.fn();
  const user = userEvent.setup();
  render(
    <DocsSearch
      knowledge={{ entries: [], loading: false, error: 'Не удалось загрузить индекс', retry }}
    >
      Начало
    </DocsSearch>,
  );
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Input' } });
  const alert = screen.getByRole('alert');
  expect(alert.textContent).toContain('Не удалось загрузить индекс');
  await user.click(within(alert).getByRole('button', { name: 'Повторить' }));
  expect(retry).toHaveBeenCalledTimes(1);
});
