import { createRef } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import * as adapters from '../../../src/unstyled.ts';
afterEach(cleanup);

it('associates group inputs with an external form', async () => {
  render(<><form id="preferences" /><adapters.CheckboxGroupAdapter form="preferences" name="topics" defaultValue={['a']}
    options={[{ value: 'a', label: 'Первый' }]} /></>);
  const input = screen.getByRole('checkbox') as HTMLInputElement;
  expect(input.form?.id).toBe('preferences');
  expect(new FormData(document.getElementById('preferences') as HTMLFormElement).getAll('topics')).toEqual(['a']);
});

it('keeps a native input ref and exposes the indeterminate state', async () => {
  const ref = createRef<HTMLInputElement>();
  render(<adapters.CheckboxAdapter ref={ref} indeterminate name="agree">Согласен</adapters.CheckboxAdapter>);
  expect(ref.current).toBe(screen.getByRole('checkbox', { name: 'Согласен' }));
  expect(ref.current?.indeterminate).toBe(true);
  expect(ref.current?.getAttribute('aria-checked')).toBe('mixed');
  await userEvent.click(ref.current!);
  expect(ref.current?.checked).toBe(true);
});

it('submits selected group values and resets uncontrolled state with the form', async () => {
  render(<form><adapters.CheckboxGroupAdapter name="topics" label="Темы" defaultValue={['a']}
    options={[{ value: 'a', label: 'Первый' }, { value: 'b', label: 'Второй' }]} /></form>);
  const second = screen.getByRole('checkbox', { name: 'Второй' }) as HTMLInputElement;
  await userEvent.click(second);
  expect(new FormData(second.form!).getAll('topics')).toEqual(['a', 'b']);
  fireEvent.reset(second.form!);
  await waitFor(() => expect(second.checked).toBe(false));
});
