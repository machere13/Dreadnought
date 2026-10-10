import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { SelectAdapter } from '../../../src/Fields/Select/SelectAdapter.tsx';

afterEach(cleanup);
const options = [
  { value: 'a', label: 'Анна' },
  { value: 'b', label: 'Борис', disabled: true },
  { value: 'c', label: 'Вера' },
];

it('removes one selected tag without submitting or opening the form', async () => {
  let submissions = 0;
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submissions++;
      }}
    >
      <SelectAdapter multiple options={options} defaultValue={['a', 'c']} name="people" />
    </form>,
  );
  const input = screen.getByRole('combobox') as HTMLInputElement;
  expect(input.value).toBe('');
  await userEvent.click(screen.getByRole('button', { name: 'Удалить Анна' }));
  expect(new FormData(input.closest('form')!).getAll('people')).toEqual(['c']);
  expect(screen.queryByRole('button', { name: 'Удалить Анна' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Удалить Вера' })).toBeTruthy();
  expect(document.activeElement).toBe(input);
  expect(input.getAttribute('aria-expanded')).toBe('false');
  expect(submissions).toBe(0);
});

it('preserves an open search when removing a tag from outside filtered results', async () => {
  render(
    <SelectAdapter
      multiple
      searchable
      defaultOpen
      options={options}
      defaultValue={['a', 'c']}
      defaultSearchValue="Вер"
    />,
  );
  const input = screen.getByRole('combobox') as HTMLInputElement;
  await userEvent.click(screen.getByRole('button', { name: 'Удалить Анна' }));
  expect(input.value).toBe('Вер');
  expect(input.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.getByRole('option', { name: 'Вера' }).getAttribute('aria-selected')).toBe('true');
});

it('respects disabled tags and keeps the last required selection', async () => {
  const { rerender } = render(
    <SelectAdapter multiple required options={options} defaultValue={['a', 'c']} />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Удалить Анна' }));
  const last = screen.getByRole('button', { name: 'Удалить Вера' }) as HTMLButtonElement;
  expect(last.disabled).toBe(true);
  await userEvent.click(last);
  expect(screen.getByRole('button', { name: 'Удалить Вера' })).toBe(last);
  rerender(<SelectAdapter multiple options={options} value={['b']} />);
  expect(
    (screen.getByRole('button', { name: 'Удалить Борис' }) as HTMLButtonElement).disabled,
  ).toBe(true);
  rerender(<SelectAdapter multiple disabled options={options} value={['a']} />);
  expect((screen.getByRole('button', { name: 'Удалить Анна' }) as HTMLButtonElement).disabled).toBe(
    true,
  );
});

it('requests a controlled removal without changing caller-owned values', async () => {
  const requests: string[][] = [];
  const { rerender } = render(
    <SelectAdapter
      multiple
      options={options}
      value={['a', 'c']}
      onValueChange={(value) => requests.push(value)}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Удалить Анна' }));
  expect(requests).toEqual([['c']]);
  expect(screen.getByRole('button', { name: 'Удалить Анна' })).toBeTruthy();
  rerender(<SelectAdapter multiple options={options} value={['c']} />);
  expect(screen.queryByRole('button', { name: 'Удалить Анна' })).toBeNull();
});

it('removes missing options with the keyboard and restores tags on form reset', async () => {
  render(
    <form>
      <SelectAdapter multiple options={options} defaultValue={['missing', 'a']} />
    </form>,
  );
  const remove = screen.getByRole('button', { name: 'Удалить missing' });
  remove.focus();
  await userEvent.keyboard('{Enter}');
  expect(screen.queryByRole('button', { name: 'Удалить missing' })).toBeNull();
  await act(async () => {
    fireEvent.reset(screen.getByRole('combobox').closest('form')!);
  });
  expect(screen.getByRole('button', { name: 'Удалить missing' })).toBeTruthy();
});

it('preserves removal slot properties, localization and consumer cancellation', async () => {
  render(
    <SelectAdapter
      multiple
      options={options}
      defaultValue={['a']}
      removeLabel={(option) => `Remove ${option.label}`}
      removeContent="Remove"
      slotProps={{
        tag: { className: 'tag' },
        remove: { onClick: (event) => event.preventDefault() },
      }}
    />,
  );
  const button = screen.getByRole('button', { name: 'Remove Анна' });
  expect(button.textContent).toBe('Remove');
  expect(button.closest('[data-slot="tag"]')?.className).toBe('tag');
  await userEvent.click(button);
  expect(screen.getByRole('button', { name: 'Remove Анна' })).toBe(button);
});
