import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { SelectAdapter } from '../../../src/Fields/Select/SelectAdapter.tsx';

afterEach(cleanup);
const options = [
  { value: 'a', label: 'Анна' },
  { value: 'b', label: 'Борис', disabled: true },
  { value: 'c', label: 'Вера' },
];

it('renders custom tags and removes them without clearing search or submitting', async () => {
  let submissions = 0;
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submissions++;
      }}
    >
      <SelectAdapter
        multiple
        searchable
        defaultOpen
        defaultSearchValue="Вер"
        options={options}
        defaultValue={['a', 'c']}
        name="people"
        removeLabel={(option) => `Remove ${option.label}`}
        tagRender={(option, { disabled, removeLabel, onRemove }) => (
          <button type="button" disabled={disabled} aria-label={removeLabel} onClick={onRemove}>
            Custom {option.label}
          </button>
        )}
      />
    </form>,
  );
  expect(screen.getByRole('button', { name: 'Remove Анна' }).textContent).toBe('Custom Анна');
  expect(screen.queryByRole('button', { name: 'Удалить Анна' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Remove Анна' }));
  const input = screen.getByRole('combobox') as HTMLInputElement;
  expect(new FormData(input.closest('form')!).getAll('people')).toEqual(['c']);
  expect(input.value).toBe('Вер');
  expect(input.getAttribute('aria-expanded')).toBe('true');
  expect(document.activeElement).toBe(input);
  expect(submissions).toBe(0);
});

it.each([
  { disabled: true, required: false, value: 'a' },
  { disabled: false, required: true, value: 'a' },
  { disabled: false, required: false, value: 'b' },
])(
  'protects custom removal when disabled or required: %j',
  async ({ disabled, required, value }) => {
    render(
      <SelectAdapter
        multiple
        options={options}
        defaultValue={[value]}
        disabled={disabled}
        required={required}
        tagRender={(option, state) => (
          <button type="button" onClick={state.onRemove}>
            {option.label}: {String(state.disabled)}
          </button>
        )}
      />,
    );
    const button = screen.getByRole('button');
    expect(button.textContent).toContain('true');
    await userEvent.click(button);
    expect(screen.getByRole('button')).toBe(button);
  },
);

it('limits custom tags while keeping missing options and caller-owned values', async () => {
  const requests: string[][] = [];
  const { rerender } = render(
    <SelectAdapter
      multiple
      options={options}
      value={['missing', 'a']}
      maxTagCount={1}
      onValueChange={(value) => requests.push(value)}
      tagRender={(option, { onRemove }) => (
        <button type="button" onClick={onRemove}>
          {option.label}
        </button>
      )}
    />,
  );
  expect(screen.queryByRole('button', { name: 'Анна' })).toBeNull();
  expect(screen.getByText('+1')).toBeTruthy();
  await userEvent.click(screen.getByRole('button', { name: 'missing' }));
  expect(requests).toEqual([['a']]);
  expect(screen.getByRole('button', { name: 'missing' })).toBeTruthy();
  rerender(<SelectAdapter multiple options={options} value={['a']} />);
  expect(screen.getByRole('button', { name: 'Удалить Анна' })).toBeTruthy();
  expect(screen.queryByText('+1')).toBeNull();
});
