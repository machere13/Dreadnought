import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { SelectAdapter } from '../../../src/Fields/Select/SelectAdapter.tsx';

afterEach(cleanup);
const options = [
  { value: 'a', label: 'Anna' },
  { value: 'b', label: 'Boris', disabled: true },
  { value: 'c', label: 'Vera' },
];

it('does not remove a single selection or values inside a disabled fieldset', () => {
  render(
    <>
      <SelectAdapter aria-label="Single" options={options} defaultValue="a" />
      <fieldset disabled>
        <SelectAdapter aria-label="Group" multiple options={options} defaultValue={['a', 'c']} />
      </fieldset>
    </>,
  );
  const single = screen.getByRole('combobox', { name: 'Single' });
  fireEvent.keyDown(single, { key: 'Backspace' });
  expect((single as HTMLInputElement).value).toBe('Anna');
  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Group' }), { key: 'Backspace' });
  expect(screen.getByRole('button', { name: 'Удалить Vera' })).toBeTruthy();
});

it('removes the last value, including hidden custom tags, without closing the popup', async () => {
  render(
    <form>
      <SelectAdapter
        multiple
        searchable
        defaultOpen
        options={options}
        defaultValue={['a', 'c']}
        name="people"
        maxTagCount={1}
        tagRender={(option) => <span>Custom {option.label}</span>}
      />
    </form>,
  );
  const input = screen.getByRole('combobox');
  input.focus();
  await userEvent.keyboard('{Backspace}');
  expect(new FormData(input.closest('form')!).getAll('people')).toEqual(['a']);
  expect(input.getAttribute('aria-expanded')).toBe('true');
  expect(document.activeElement).toBe(input);
  await userEvent.keyboard('{Backspace}{Backspace}');
  expect(new FormData(input.closest('form')!).getAll('people')).toEqual([]);
});

it('edits search text before removing a tag', async () => {
  render(
    <SelectAdapter
      multiple
      searchable
      defaultOpen
      options={options}
      defaultSearchValue="Ve"
      defaultValue={['a', 'c']}
    />,
  );
  const input = screen.getByRole('combobox') as HTMLInputElement;
  input.focus();
  await userEvent.keyboard('{Backspace}');
  expect(input.value).toBe('V');
  expect(screen.getByRole('button', { name: 'Удалить Vera' })).toBeTruthy();
  await userEvent.keyboard('{Backspace}');
  expect(input.value).toBe('');
  expect(screen.getByRole('button', { name: 'Удалить Vera' })).toBeTruthy();
  await userEvent.keyboard('{Backspace}');
  expect(screen.queryByRole('button', { name: 'Удалить Vera' })).toBeNull();
});

it.each([
  { required: true, defaultValue: ['a'] },
  { disabled: true, defaultValue: ['a', 'c'] },
  { defaultValue: ['a', 'b'] },
  {
    defaultValue: ['a', 'c'],
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => event.preventDefault(),
  },
  {
    defaultValue: ['a', 'c'],
    slotProps: {
      control: {
        onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => event.preventDefault(),
      },
    },
  },
])('preserves protected selections: %j', (props) => {
  render(
    <form>
      <SelectAdapter multiple options={options} name="people" {...props} />
    </form>,
  );
  const input = screen.getByRole('combobox');
  fireEvent.keyDown(input, { key: 'Backspace' });
  const select = input.closest('form')!.querySelector('select')!;
  expect(Array.from(select.selectedOptions, (option) => option.value)).toEqual(props.defaultValue);
});

it('requests controlled removal but leaves owner values intact, ignoring IME and modifiers', () => {
  const requests: string[][] = [];
  render(
    <SelectAdapter
      multiple
      options={options}
      value={['a', 'c']}
      onValueChange={(value) => requests.push(value)}
    />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.keyDown(input, { key: 'Backspace', isComposing: true });
  fireEvent.keyDown(input, { key: 'Backspace', ctrlKey: true });
  expect(requests).toEqual([]);
  fireEvent.keyDown(input, { key: 'Backspace' });
  expect(requests).toEqual([['a']]);
  expect(screen.getByRole('button', { name: 'Удалить Vera' })).toBeTruthy();
});
