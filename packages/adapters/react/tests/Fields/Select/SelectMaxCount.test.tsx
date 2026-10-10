import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { SelectAdapter } from '../../../src/Fields/Select/SelectAdapter.tsx';

afterEach(cleanup);
const options = [
  { value: 'a', label: 'Анна' },
  { value: 'b', label: 'Борис' },
  { value: 'c', label: 'Вера' },
];

it('blocks a mouse selection at the limit and permits replacement after removal', async () => {
  render(
    <form>
      <SelectAdapter
        multiple
        maxCount={1}
        defaultOpen
        options={options}
        defaultValue={['a']}
        name="people"
      />
    </form>,
  );
  const input = screen.getByRole('combobox');
  const boris = screen.getByRole('option', { name: 'Борис' });
  expect(boris.getAttribute('aria-disabled')).toBe('true');
  await userEvent.click(boris);
  expect(new FormData(input.closest('form')!).getAll('people')).toEqual(['a']);
  await userEvent.click(screen.getByRole('button', { name: 'Удалить Анна' }));
  expect(boris.getAttribute('aria-disabled')).toBeNull();
  await userEvent.click(boris);
  expect(new FormData(input.closest('form')!).getAll('people')).toEqual(['b']);
});

it('skips unavailable choices with the keyboard and allows deselecting at the limit', async () => {
  render(
    <SelectAdapter multiple maxCount={1} defaultOpen options={options} defaultValue={['b']} />,
  );
  const input = screen.getByRole('combobox');
  input.focus();
  await userEvent.keyboard('{ArrowDown}{Enter}');
  expect(screen.queryByRole('button', { name: 'Удалить Вера' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Удалить Борис' })).toBeNull();
  expect(screen.getByRole('option', { name: 'Вера' }).getAttribute('aria-disabled')).toBeNull();
});

it('preserves caller-owned selections when the limit is lowered', () => {
  const { rerender } = render(
    <SelectAdapter multiple defaultOpen options={options} value={['a', 'b']} />,
  );
  rerender(
    <SelectAdapter multiple maxCount={0} defaultOpen options={options} value={['a', 'b']} />,
  );
  expect(screen.getAllByRole('button')).toHaveLength(2);
  expect(screen.getByRole('option', { name: 'Вера' }).getAttribute('aria-disabled')).toBe('true');
  expect(screen.getByRole('option', { name: 'Анна' }).getAttribute('aria-disabled')).toBeNull();
});
