import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { DocsPage } from './helpers/DocsPage.tsx';

afterEach(cleanup);
it('documents Progress with a real editable value and a Feedback link', () => {
  render(<DocsPage section="progress" />);
  expect(document.getElementById('progress-api')).toBeTruthy();
  const progress = screen.getByRole('progressbar', { name: 'Загрузка файла' });
  expect(progress.getAttribute('aria-valuenow')).toBe('35');
  fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }));
  expect(progress.getAttribute('aria-valuenow')).toBe('45');
  expect(screen.getByRole('link', { name: 'Progress' }).getAttribute('href')).toBe('/components/progress/');
});
it('shows a real toast from the documentation demo', () => {
  render(<DocsPage section="toast" />);
  expect(document.getElementById('toast-api')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Показать уведомление' }));
  const viewport = within(screen.getByRole('region', { name: 'Уведомления' }));
  expect(viewport.getByRole('status').textContent).toContain('Изменения сохранены');
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть уведомление' }));
  expect(viewport.queryByRole('status')).toBeNull();
});
it('toggles the loader over actual documentation content', () => {
  render(<DocsPage section="loader" />);
  expect(document.getElementById('loader-api')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Начать загрузку' }));
  expect(screen.getByRole('status', { name: 'Загрузка данных' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Завершить загрузку' }));
  expect(screen.queryByRole('status', { name: 'Загрузка данных' })).toBeNull();
});
