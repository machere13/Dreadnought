import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { Switch } from '../src/adapters/react/index.ts';

afterEach(cleanup);

it('shows the shared loader only while saving and keeps the switch accessible', () => {
  const { rerender } = render(<Switch loading>Alerts</Switch>);
  const input = screen.getByRole('switch', { name: 'Alerts' });
  const root = input.closest('label')!;
  expect(root.querySelector('[data-ui="loader"]')).not.toBeNull();
  expect(input.getAttribute('aria-busy')).toBe('true');
  rerender(<Switch>Alerts</Switch>);
  expect(root.querySelector('[data-ui="loader"]')).toBeNull();
  expect(input.hasAttribute('loading')).toBe(false);
});
it('preserves native selection and consumer slots with presentation attached', async () => {
  render(
    <Switch className="custom" slotProps={{ indicator: { className: 'track' } }}>
      Согласие
    </Switch>,
  );
  const input = screen.getByRole('switch') as HTMLInputElement;
  expect(input.closest('label')?.className).toContain('dreadnought-text-switch');
  expect(input.closest('label')?.className).toContain('custom');
  expect(input.closest('label')?.querySelector('.track')).not.toBeNull();
  await userEvent.click(input);
  expect(input.checked).toBe(true);
});
