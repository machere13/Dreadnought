import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import * as adapters from '../../../src/unstyled.ts';
afterEach(cleanup);
const options = [
  { value: 'a', label: 'Анна' },
  { value: 'b', label: 'Борис', disabled: true },
  { value: 'c', label: 'Вера' },
];

it('stops keyboard navigation at the first and last available options', async () => {
  render(<adapters.SelectAdapter aria-label="Выбор" options={options} />);
  const input = screen.getByRole('combobox');
  input.focus();
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
  expect(input.getAttribute('aria-activedescendant')).toBe(
    screen.getByRole('option', { name: 'Вера' }).id,
  );
  await userEvent.keyboard('{Home}{ArrowUp}');
  expect(input.getAttribute('aria-activedescendant')).toBe(
    screen.getByRole('option', { name: 'Анна' }).id,
  );
  await userEvent.keyboard('{End}{Enter}');
  expect((input as HTMLInputElement).value).toBe('Вера');
});

it('keeps the final required selection when clear is requested', async () => {
  render(
    <adapters.SelectAdapter
      aria-label="Выбор"
      options={options}
      defaultValue="a"
      required
      allowClear
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Очистить выбор' }));
  expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Анна');
});

it('leaves Home and End to the searchable input rather than moving the active option', async () => {
  render(<adapters.SelectAdapter searchable aria-label="Поиск" options={options} />);
  const input = screen.getByRole('combobox', { name: 'Поиск' });
  input.focus();
  await userEvent.keyboard('{ArrowDown}{ArrowDown}');
  const last = screen.getByRole('option', { name: 'Вера' }).id;
  expect(input.getAttribute('aria-activedescendant')).toBe(last);
  expect(fireEvent.keyDown(input, { key: 'Home' })).toBe(true);
  expect(fireEvent.keyDown(input, { key: 'End' })).toBe(true);
  expect(input.getAttribute('aria-activedescendant')).toBe(last);
});

it('respects a cancelled form reset and dismisses without committing', async () => {
  render(
    <form onReset={(event) => event.preventDefault()}>
      <adapters.SelectAdapter aria-label="Выбор" options={options} defaultValue="a" />
    </form>,
  );
  const input = screen.getByRole('combobox', { name: 'Выбор' }) as HTMLInputElement;
  await userEvent.click(input);
  await userEvent.click(screen.getByRole('option', { name: 'Вера' }));
  await act(async () => {
    fireEvent.reset(input.closest('form')!);
  });
  expect(input.value).toBe('Вера');
  await userEvent.click(input);
  await userEvent.keyboard('{ArrowDown}{Escape}');
  expect(input.value).toBe('Вера');
  expect(screen.queryByRole('listbox')).toBeNull();
});

it('preserves consumer cancellation and refuses disabled options', async () => {
  render(
    <adapters.SelectAdapter
      aria-label="Выбор"
      options={options}
      onKeyDown={(event) => event.preventDefault()}
    />,
  );
  const input = screen.getByRole('combobox');
  input.focus();
  await userEvent.keyboard('{ArrowDown}');
  expect(screen.queryByRole('listbox')).toBeNull();
  await userEvent.click(input);
  await userEvent.click(screen.getByRole('option', { name: 'Борис' }));
  expect((input as HTMLInputElement).value).toBe('');
});

it('uses combobox/listbox semantics, skips disabled options and commits with Enter', async () => {
  render(
    <form>
      <adapters.SelectAdapter aria-label="Исполнитель" options={options} name="owner" />
    </form>,
  );
  const input = screen.getByRole('combobox', { name: 'Исполнитель' });
  input.focus();
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  expect((input as HTMLInputElement).value).toBe('Вера');
  expect(screen.queryByRole('listbox')).toBeNull();
  expect(new FormData(input.closest('form')!).get('owner')).toBe('c');
});

it('filters by search, preserves multiple choices and allows clearing', async () => {
  render(
    <adapters.SelectAdapter multiple searchable allowClear aria-label="Люди" options={options} />,
  );
  const input = screen.getByRole('combobox', { name: 'Люди' });
  await userEvent.type(input, 'ан');
  expect(screen.queryByRole('option', { name: 'Вера' })).toBeNull();
  await userEvent.click(screen.getByRole('option', { name: 'Анна' }));
  expect(screen.getByRole('option', { name: 'Анна' }).getAttribute('aria-selected')).toBe('true');
  await userEvent.click(screen.getByRole('option', { name: 'Вера' }));
  await userEvent.keyboard('{Escape}');
  expect((input as HTMLInputElement).value).toBe('Анна, Вера');
  await userEvent.click(screen.getByRole('button', { name: 'Очистить выбор' }));
  expect((input as HTMLInputElement).value).toBe('');
});

it('controlled values remain caller-owned and form reset restores default values', async () => {
  let next: string | null = null;
  const { rerender } = render(
    <form>
      <adapters.SelectAdapter
        aria-label="Выбор"
        options={options}
        value="a"
        onValueChange={(v) => {
          next = v;
        }}
      />
    </form>,
  );
  const input = screen.getByRole('combobox', { name: 'Выбор' });
  await userEvent.click(input);
  await userEvent.click(screen.getByRole('option', { name: 'Вера' }));
  expect(next).toBe('c');
  expect((input as HTMLInputElement).value).toBe('Анна');
  rerender(
    <form>
      <adapters.SelectAdapter aria-label="Выбор" options={options} defaultValue="a" />
    </form>,
  );
  await userEvent.click(input);
  await userEvent.click(screen.getByRole('option', { name: 'Вера' }));
  fireEvent.reset(input.closest('form')!);
  await waitFor(() => expect((input as HTMLInputElement).value).toBe('Анна'));
});
