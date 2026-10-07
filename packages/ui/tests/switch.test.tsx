import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { Switch } from '../src/adapters/react/index.ts';

afterEach(cleanup);
it('preserves native selection and consumer slots with presentation attached', async () => {
  render(<Switch className="custom" slotProps={{ indicator: { className: 'track' } }}>Согласие</Switch>);
  const input = screen.getByRole('switch') as HTMLInputElement;
  expect(input.closest('label')?.className).toContain('dreadnought-text-switch');
  expect(input.closest('label')?.className).toContain('custom');
  expect(input.closest('label')?.querySelector('.track')).not.toBeNull();
  await userEvent.click(input);
  expect(input.checked).toBe(true);
});
