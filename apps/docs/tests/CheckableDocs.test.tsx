import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { checkboxDoc } from '../src/content/components/Fields/Checkbox/CheckboxDoc.tsx';
import { switchDoc } from '../src/content/components/Fields/Switch/SwitchDoc.tsx';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it.each([
  ['Checkbox', checkboxDoc, 4],
  ['Switch', switchDoc, 3],
] as const)('pairs each %s example with its full portable source', (_name, doc, count) => {
  expect(doc.examples).toHaveLength(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Fields', doc.title, `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('derives select-all and partial selection from the actual checked channels', () => {
  render(checkboxDoc.examples![2].demo);
  const all = screen.getByRole('checkbox', { name: 'Все каналы' }) as HTMLInputElement;
  expect(all.indeterminate).toBe(true);
  fireEvent.click(all);
  expect(all.checked).toBe(true);
  expect(all.indeterminate).toBe(false);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Push' }));
  expect(all.checked).toBe(false);
  expect(all.indeterminate).toBe(true);
  expect(screen.getByRole('status').textContent).toContain('Почта');
  expect(screen.getByRole('status').textContent).not.toContain('Push');
  fireEvent.click(all);
  fireEvent.click(all);
  expect(screen.getByRole('status').textContent).toContain('нет');
});

it('updates the group result without selecting disabled SMS', () => {
  render(checkboxDoc.examples![1].demo);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Push' }));
  expect(screen.getByRole('status').textContent).toContain('email, push');
  const sms = screen.getByRole('checkbox', { name: 'SMS' }) as HTMLInputElement;
  expect(sms.disabled).toBe(true);
  expect(sms.checked).toBe(false);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Почта' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Push' }));
  expect(screen.getByRole('status').textContent).toContain('нет');
});

it.each([
  ['checkbox', checkboxDoc],
  ['switch', switchDoc],
] as const)('updates the %s result using Space', async (role, doc) => {
  const user = userEvent.setup();
  render(doc.examples![0].demo);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole(role, { name: 'Получать уведомления' }));
  await user.keyboard(' ');
  expect(screen.getByRole('status').textContent).toContain('включены');
  await user.keyboard(' ');
  expect(screen.getByRole('status').textContent).toContain('выключены');
});

it('finishes a simulated Switch save once without losing focus', () => {
  vi.useFakeTimers();
  render(switchDoc.examples![1].demo);
  const control = screen.getByRole('switch', { name: 'Автосохранение' }) as HTMLInputElement;
  control.focus();
  fireEvent.click(control);
  expect(control.checked).toBe(false);
  expect(control.getAttribute('aria-busy')).toBe('true');
  expect(document.activeElement).toBe(control);
  fireEvent.click(control);
  act(() => vi.advanceTimersByTime(1000));
  expect(control.checked).toBe(true);
  expect(control.getAttribute('aria-busy')).not.toBe('true');
  expect(screen.getByRole('status').textContent).toContain('включено');
  fireEvent.click(control);
  act(() => vi.advanceTimersByTime(1000));
  expect(control.checked).toBe(false);
  expect(screen.getByRole('status').textContent).toContain('выключено');
});

it('cancels a simulated Switch save on unmount', () => {
  vi.useFakeTimers();
  const view = render(switchDoc.examples![1].demo);
  fireEvent.click(screen.getByRole('switch', { name: 'Автосохранение' }));
  expect(vi.getTimerCount()).toBe(1);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
