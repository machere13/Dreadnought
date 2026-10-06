import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import * as ui from '@dreadnought/ui/react';

afterEach(cleanup);
it('renders a themed toast with a status icon inside a positioned viewport', () => {
  expect(ui).toHaveProperty('Toast');
  expect(ui).toHaveProperty('ToastViewport');
  render(<ui.ToastViewport placement="bottom"><ui.Toast title="Готово" type="success" duration={0} /></ui.ToastViewport>);
  expect(screen.getByRole('status').getAttribute('data-type')).toBe('success');
  expect(screen.getByRole('status').querySelector('[data-slot="icon"] svg')).toBeTruthy();
  expect(document.querySelector('[data-ui="toast-viewport"]')?.getAttribute('data-placement')).toBe('bottom');
  expect(screen.getByRole('button').querySelector('svg')).toBeTruthy();
});
it('renders a themed loader without replacing a custom indicator', () => {
  expect(ui).toHaveProperty('Loader');
  const { rerender } = render(<ui.Loader size="large" label="Загрузка" showLabel />);
  expect(screen.getByRole('status').parentElement?.getAttribute('data-size')).toBe('large');
  expect(screen.getByText('Загрузка')).toBeTruthy();
  rerender(<ui.Loader indicator={<span>Свой индикатор</span>} />);
  expect(screen.getByText('Свой индикатор')).toBeTruthy();
  expect(screen.getByRole('status').parentElement?.hasAttribute('data-custom-indicator')).toBe(true);
});
