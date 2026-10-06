import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { DocsPage } from '../src/components/DocsPage';

afterEach(cleanup);
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
