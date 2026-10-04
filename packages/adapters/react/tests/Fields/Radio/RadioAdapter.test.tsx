import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import * as adapters from '../../../src/unstyled.ts';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('allows exactly one value and supports keyboard movement across enabled radios', async () => {
  // jsdom lacks CSS.escape; this fixture uses the plain identifier "plan".
  vi.stubGlobal('CSS', { escape: (value: string) => value });
  render(<adapters.RadioGroupAdapter label="Тариф" name="plan" defaultValue="a"
    options={[{ value: 'a', label: 'Первый' }, { value: 'b', label: 'Второй', disabled: true }, { value: 'c', label: 'Третий' }]} />);
  const first = screen.getByRole('radio', { name: 'Первый' });
  first.focus();
  await userEvent.keyboard('{ArrowRight}');
  expect((screen.getByRole('radio', { name: 'Третий' }) as HTMLInputElement).checked).toBe(true);
  expect((first as HTMLInputElement).checked).toBe(false);
});

it('controlled groups request a value without mutating the supplied selection', () => {
  let next = '';
  render(<adapters.RadioGroupAdapter label="Выбор" value="a" onValueChange={value => { next = value; }}
    options={[{ value: 'a', label: 'Первый' }, { value: 'b', label: 'Второй' }]} />);
  fireEvent.click(screen.getByRole('radio', { name: 'Второй' }));
  expect(next).toBe('b');
  expect((screen.getByRole('radio', { name: 'Первый' }) as HTMLInputElement).checked).toBe(true);
});
