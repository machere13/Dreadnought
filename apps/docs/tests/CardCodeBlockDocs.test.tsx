import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { cardDoc } from '../src/content/components/Surfaces/Card/CardDoc.tsx';
import { codeBlockDoc } from '../src/content/components/DataDisplay/CodeBlock/CodeBlockDoc.tsx';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it.each([
  ['Card', cardDoc, 'Surfaces', 3],
  ['CodeBlock', codeBlockDoc, 'DataDisplay', 2],
] as const)('pairs each %s demo with its complete source', (_name, doc, folder, count) => {
  expect(doc.examples).toHaveLength(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components', folder, doc.title, `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('toggles only the details controlled by the Card header action', () => {
  render(cardDoc.examples![0].demo);
  expect(screen.queryByText('В карточку можно вложить любые компоненты.')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Подробнее' }));
  expect(screen.getByText('В карточку можно вложить любые компоненты.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Скрыть' }));
  expect(screen.queryByText('В карточку можно вложить любые компоненты.')).toBeNull();
});

it('updates the Card footer and provides a real documentation destination', () => {
  render(cardDoc.examples![2].demo);
  expect(screen.getByText('Обновлено сегодня')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Обновить' }));
  expect(screen.getByText('Только что обновлено')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Документация' }).getAttribute('href')).toBe(
    '/getting-started/',
  );
  const image = screen.getByRole('img', { name: 'Обложка проекта Dreadnought' });
  expect(
    readFileSync(resolve('apps/docs/public', image.getAttribute('src')!.slice(1)), 'utf8'),
  ).toContain('<svg');
});

it('copies the displayed code exactly and resets the confirmation icon', async () => {
  vi.useFakeTimers();
  const writeText = vi.fn(async () => {});
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  const { container } = render(codeBlockDoc.examples![0].demo);
  expect(container.querySelector('pre code')?.textContent).toBe('const answer = 42;\n');
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Копировать пример' }));
  });
  expect(writeText).toHaveBeenCalledExactlyOnceWith('const answer = 42;\n');
  expect(screen.getByRole('button', { name: 'Пример скопирован' })).toBeTruthy();
  act(() => vi.runOnlyPendingTimers());
  expect(screen.getByRole('button', { name: 'Копировать пример' })).toBeTruthy();
});

it('reports a clipboard failure and clears it after a successful retry', async () => {
  const writeText = vi
    .fn()
    .mockRejectedValueOnce(new Error('Permission denied'))
    .mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  render(codeBlockDoc.examples![0].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Копировать пример' }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Не удалось скопировать пример' }));
  expect(await screen.findByRole('button', { name: 'Пример скопирован' })).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(writeText).toHaveBeenNthCalledWith(2, 'const answer = 42;\n');
});

it('preserves indentation and newlines without exposing copy controls', () => {
  const { container } = render(codeBlockDoc.examples![1].demo);
  expect(Array.from(container.querySelectorAll('pre code'), (node) => node.textContent)).toEqual([
    'def greet(name):\n    return f"Hello, {name}"\n',
    'npm install @dreadnought/ui',
  ]);
  expect(screen.queryByRole('button')).toBeNull();
});
