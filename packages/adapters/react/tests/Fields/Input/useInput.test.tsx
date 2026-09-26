import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { useInput } from '../../../src/Fields/Input/useInput.ts';

afterEach(cleanup);

it('provides props for custom markup without styling it', () => {
  function CustomInput() {
    const { inputProps, visibilityButtonProps } = useInput({ type: 'search', invalid: true });
    expect(visibilityButtonProps).toBeUndefined();
    return <input {...inputProps} aria-label="Find" />;
  }
  render(<CustomInput />);
  const input = screen.getByRole('searchbox', { name: 'Find' });
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.hasAttribute('class')).toBe(false);
});

it('provides password visibility behavior for custom markup', async () => {
  const user = userEvent.setup();
  function CustomPasswordInput() {
    const { inputProps, visibilityButtonProps } = useInput({
      type: 'password',
      defaultValue: 'secret',
      passwordVisibilityLabels: { show: 'Показать пароль', hide: 'Скрыть пароль' },
    });
    return <><input {...inputProps} aria-label="Пароль" /><button {...visibilityButtonProps} /></>;
  }
  render(<CustomPasswordInput />);
  const input = screen.getByLabelText('Пароль') as HTMLInputElement;
  expect(input.type).toBe('password');
  await user.click(screen.getByRole('button', { name: 'Показать пароль' }));
  expect(input.type).toBe('text');
  expect(input.value).toBe('secret');
  expect(screen.getByRole('button', { name: 'Скрыть пароль' }).getAttribute('type')).toBe('button');
});
