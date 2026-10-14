import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { FormDemo } from '../src/content/components/Fields/FormDemo.tsx';

afterEach(cleanup);

it('validates, submits and resets the complete documentation example', async () => {
  render(<FormDemo />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(await screen.findByText('Введите имя')).toBeTruthy();
  const name = screen.getByRole('textbox', { name: 'Имя' });
  await user.type(name, 'admin');
  await user.tab();
  expect(await screen.findByText('Это имя занято')).toBeTruthy();
  await user.clear(name);
  await user.type(screen.getByRole('textbox', { name: 'Имя' }), 'Ada');
  await user.type(screen.getByLabelText(/^Пароль/, { selector: 'input' }), 'password');
  await user.type(screen.getByLabelText(/^Подтверждение пароля/, { selector: 'input' }), 'other');
  await user.click(screen.getByRole('combobox', { name: 'Роль' }));
  await user.click(await screen.findByRole('option', { name: 'Редактор' }));
  await user.click(screen.getByRole('checkbox', { name: 'Принимаю условия' }));
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(await screen.findByText('Пароли не совпадают')).toBeTruthy();
  await user.clear(screen.getByLabelText(/^Подтверждение пароля/, { selector: 'input' }));
  await user.type(
    screen.getByLabelText(/^Подтверждение пароля/, { selector: 'input' }),
    'password',
  );
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Сохранено: Ada'));
  expect(screen.getByRole('status').textContent).toContain('Роль: Редактор');
  expect(screen.getByRole('status').textContent).not.toContain('password');
  await user.click(screen.getByRole('button', { name: 'Сбросить' }));
  expect((screen.getByRole('textbox', { name: 'Имя' }) as HTMLInputElement).value).toBe('');
  expect(screen.queryByText('Сохранено: Ada')).toBeNull();
});
