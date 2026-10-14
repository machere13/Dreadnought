import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { loaderDoc } from '../src/content/components/Feedback/LoaderDoc.tsx';
import { toastDoc } from '../src/content/components/Feedback/ToastDoc.tsx';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('pairs each Loader example with its full portable source', () => {
  expect(loaderDoc.examples).toHaveLength(3);
  for (const example of loaderDoc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Feedback', `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('blocks the Loader content immediately, delays the indicator and preserves input', () => {
  vi.useFakeTimers();
  render(loaderDoc.examples![1].demo);
  const region = screen.getByRole('region', { name: 'Данные проекта' });
  const field = screen.getByRole('textbox', { name: 'Черновик проекта' });
  fireEvent.change(field, { target: { value: 'Моя заметка' } });
  fireEvent.click(screen.getByRole('button', { name: 'Начать загрузку' }));
  expect(region.getAttribute('aria-busy')).toBe('true');
  expect(field.closest('[inert]')).toBeTruthy();
  act(() => vi.advanceTimersByTime(199));
  expect(screen.queryByRole('status', { name: 'Загрузка данных' })).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole('status', { name: 'Загрузка данных' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Завершить загрузку' }));
  expect(region.getAttribute('aria-busy')).toBe('false');
  expect(field.closest('[inert]')).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Черновик проекта' })).toBe(field);
  expect(field).toHaveProperty('value', 'Моя заметка');
});

it('cancels a short Loader wait before its delayed indicator appears', () => {
  vi.useFakeTimers();
  render(loaderDoc.examples![1].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Начать загрузку' }));
  act(() => vi.advanceTimersByTime(100));
  fireEvent.click(screen.getByRole('button', { name: 'Завершить загрузку' }));
  act(() => vi.advanceTimersByTime(500));
  expect(screen.queryByRole('status', { name: 'Загрузка данных' })).toBeNull();
  expect(screen.getByRole('region', { name: 'Данные проекта' }).getAttribute('aria-busy')).toBe(
    'false',
  );
});

it('names the standalone indicators and the custom waiting graphic', () => {
  render(loaderDoc.examples![0].demo);
  for (const size of ['small', 'default', 'large']) {
    expect(screen.getByRole('status', { name: `Загрузка: ${size}` })).toBeTruthy();
  }
  cleanup();
  render(loaderDoc.examples![2].demo);
  expect(screen.getByRole('status', { name: 'Ожидание ответа' })).toBeTruthy();
});

it('opens and closes each of the six placement choices without taking focus', () => {
  render(toastDoc.examples![2].demo);
  for (const label of [
    'Сверху слева',
    'Сверху по центру',
    'Сверху справа',
    'Снизу слева',
    'Снизу по центру',
    'Снизу справа',
  ]) {
    const trigger = screen.getByRole('button', { name: label });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('status').textContent).toContain(`Положение: ${label}`);
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть пример положения' }));
    expect(screen.queryByRole('status')).toBeNull();
  }
});

it('keeps an actionable error until retry then times out the success', () => {
  vi.useFakeTimers();
  render(toastDoc.examples![3].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Показать ошибку' }));
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.getByRole('alert').textContent).toContain('Не удалось сохранить');
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByRole('status').textContent).toContain('Повторная попытка выполнена');
  act(() => vi.advanceTimersByTime(2999));
  expect(screen.getByRole('status')).toBeTruthy();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole('status')).toBeNull();
});
