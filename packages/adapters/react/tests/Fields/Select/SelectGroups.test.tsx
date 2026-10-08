import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { SelectAdapter } from '../../../src/unstyled.ts';
afterEach(cleanup);
const options = [
  { value: 'none', label: 'Без команды' },
  {
    label: 'Команда',
    options: [
      { value: 'a', label: 'Анна' },
      { value: 'b', label: 'Борис', disabled: true },
    ],
  },
  { label: 'Архив', disabled: true, options: [{ value: 'c', label: 'Вера' }] },
  { label: 'Гости', options: [{ value: 'd', label: 'Даша' }] },
];

it('navigates group options while skipping headings and disabled children', async () => {
  const { container } = render(
    <form>
      <SelectAdapter aria-label="Исполнитель" options={options} name="owner" defaultOpen />
    </form>,
  );
  const input = screen.getByRole('combobox');
  expect(
    within(screen.getByRole('group', { name: 'Команда' })).getAllByRole('option'),
  ).toHaveLength(2);
  expect(screen.getByRole('option', { name: 'Вера' }).getAttribute('aria-disabled')).toBe('true');
  input.focus();
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  expect((input as HTMLInputElement).value).toBe('Даша');
  expect(new FormData(container.querySelector('form')!).get('owner')).toBe('d');
  expect(container.querySelectorAll('optgroup')).toHaveLength(3);
});

it('hides groups without matching options and keeps a global optionRender index', () => {
  render(
    <SelectAdapter
      aria-label="Поиск"
      options={options}
      searchable
      defaultOpen
      optionRender={(option, state) => `${state.index}: ${option.label}`}
    />,
  );
  expect(screen.getByRole('option', { name: 'Даша' }).textContent).toBe('4: Даша');
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'даш' } });
  expect(screen.queryByRole('group', { name: 'Команда' })).toBeNull();
  expect(screen.getByRole('group', { name: 'Гости' })).toBeTruthy();
  expect(screen.getByRole('option', { name: 'Даша' }).textContent).toBe('0: Даша');
});
