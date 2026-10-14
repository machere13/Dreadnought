import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { buttonDoc } from '../src/content/components/Controls/ButtonDoc.tsx';
import { ButtonVariantsDemo } from '../src/content/components/Controls/ButtonVariantsDemo.tsx';
import { ButtonSizesDemo } from '../src/content/components/Controls/ButtonSizesDemo.tsx';
import { ButtonIconsDemo } from '../src/content/components/Controls/ButtonIconsDemo.tsx';
import { ButtonLoadingDemo } from '../src/content/components/Controls/ButtonLoadingDemo.tsx';
import { ButtonFormDemo } from '../src/content/components/Controls/ButtonFormDemo.tsx';
import { ButtonLinkDemo } from '../src/content/components/Controls/ButtonLinkDemo.tsx';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('pairs all six Button scenarios with their exact runnable source', () => {
  expect(buttonDoc.examples).toHaveLength(6);
  for (const example of buttonDoc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Controls', `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
    expect(example.description).toBeTruthy();
  }
});

it('makes every appearance variant perform the same documented action', () => {
  render(<ButtonVariantsDemo />);
  for (const name of ['Нажать', 'Вторичная', 'С рамкой', 'Без фона']) {
    fireEvent.click(screen.getByRole('button', { name }));
  }
  expect(screen.getByRole('status').textContent).toBe('Нажатий: 4');
});

it('reports which size was activated', () => {
  render(<ButtonSizesDemo />);
  fireEvent.click(screen.getByRole('button', { name: 'Обычная кнопка' }));
  expect(screen.getByRole('status').textContent).toBe('Последняя кнопка: обычная');
  fireEvent.click(screen.getByRole('button', { name: 'Компактная кнопка' }));
  expect(screen.getByRole('status').textContent).toBe('Последняя кнопка: компактная');
});

it('provides an accessible icon-only toggle and working labelled icon actions', () => {
  render(<ButtonIconsDemo />);
  const toggle = screen.getByRole('button', { name: 'Закладка документа' });
  expect(toggle.getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('Документ в закладках');
  fireEvent.click(screen.getByRole('button', { name: 'Удалить закладку' }));
  expect(toggle.getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(screen.getByRole('button', { name: 'Добавить закладку' }));
  expect(toggle.getAttribute('aria-pressed')).toBe('true');
});

it('completes one simulated save and preserves focus while loading', () => {
  vi.useFakeTimers();
  render(<ButtonLoadingDemo />);
  const button = screen.getByRole('button', { name: 'Сохранить изменения' });
  button.focus();
  fireEvent.click(button);
  expect(button.getAttribute('aria-busy')).toBe('true');
  expect(button).toHaveProperty('disabled', false);
  expect(document.activeElement).toBe(button);
  act(() => vi.advanceTimersByTime(500));
  fireEvent.click(button);
  act(() => vi.advanceTimersByTime(500));
  expect(screen.getByText('Успешных сохранений: 1')).toBeTruthy();
  expect(button.getAttribute('aria-busy')).not.toBe('true');
});

it('cancels the simulated operation when its example is unmounted', () => {
  vi.useFakeTimers();
  const view = render(<ButtonLoadingDemo />);
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));
  expect(vi.getTimerCount()).toBe(1);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('skips the disabled control when navigating with Tab', async () => {
  const user = userEvent.setup();
  render(
    <>
      <ButtonLoadingDemo />
      <button>После примера</button>
    </>,
  );
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Сохранить изменения' }));
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'После примера' }));
});

it('submits the real form with Enter and resets both input and result', async () => {
  const user = userEvent.setup();
  render(<ButtonFormDemo />);
  const field = screen.getByRole('textbox', { name: 'Имя для отправки' });
  await user.type(field, 'Анна{Enter}');
  expect(screen.getByRole('status').textContent).toBe('Отправлено имя: Анна');
  await user.click(screen.getByRole('button', { name: 'Очистить форму' }));
  expect(field).toHaveProperty('value', '');
  expect(screen.getByRole('status').textContent).toBe('Форма ещё не отправлена');
  await user.click(screen.getByRole('button', { name: 'Отправить форму' }));
  expect(screen.getByRole('status').textContent).toBe('Форма ещё не отправлена');
});

it('creates a native link with an existing destination instead of a fake click action', () => {
  render(<ButtonLinkDemo />);
  const link = screen.getByRole('link', { name: 'Перейти к цели ссылки' });
  expect(link.tagName).toBe('A');
  expect(link.getAttribute('href')).toBe('#button-link-target');
  expect(document.getElementById('button-link-target')).toBeTruthy();
});
