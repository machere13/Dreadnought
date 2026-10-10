import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { SelectAdapter } from '../../../src/Fields/Select/SelectAdapter.tsx';

afterEach(cleanup);
const options = [
  { value: 'a', label: 'Anna' },
  { value: 'b', label: 'Boris', disabled: true },
];
it('uses showSearch configuration for filtering, sorting and keyboard selection', async () => {
  const user = userEvent.setup();
  render(
    <SelectAdapter
      options={[...options, { value: 'aa', label: 'Zoe' }]}
      showSearch={{
        optionFilterProp: 'value',
        filterSort: (a, b) => b.value.localeCompare(a.value),
      }}
    />,
  );
  const input = screen.getByRole('combobox') as HTMLInputElement;
  await user.click(input);
  await user.type(input, 'a');
  expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
    'Zoe',
    'Anna',
  ]);
  await user.keyboard('{Enter}');
  expect(input.value).toBe('Zoe');
});
it('keeps nested search controlled and gives nested settings precedence over legacy props', () => {
  const searches: string[] = [];
  const { rerender } = render(
    <SelectAdapter
      options={options}
      defaultOpen
      searchable
      searchValue="legacy"
      filterOption
      onSearch={() => {
        throw new Error('legacy callback');
      }}
      showSearch={{
        searchValue: 'remote',
        filterOption: false,
        onSearch: (next) => searches.push(next),
      }}
    />,
  );
  const input = screen.getByRole('combobox') as HTMLInputElement;
  expect(input.value).toBe('remote');
  fireEvent.change(input, { target: { value: 'next' } });
  expect(searches).toEqual(['next']);
  expect(input.value).toBe('remote');
  rerender(<SelectAdapter options={options} defaultOpen searchable showSearch={false} />);
  expect(input.readOnly).toBe(true);
  expect(input.getAttribute('aria-autocomplete')).toBe('none');
});

it('keeps opening caller-owned and reports keyboard requests', () => {
  const requests: boolean[] = [];
  const { rerender } = render(
    <SelectAdapter options={options} open={false} onOpenChange={(next) => requests.push(next)} />,
  );
  const input = screen.getByRole('combobox');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  expect(requests).toEqual([true]);
  expect(input.getAttribute('aria-expanded')).toBe('false');
  rerender(<SelectAdapter options={options} open onOpenChange={(next) => requests.push(next)} />);
  expect(screen.getByRole('listbox')).toBeTruthy();
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(requests).toEqual([true, false]);
  expect(input.getAttribute('aria-expanded')).toBe('true');
});

it('keeps search caller-owned and does not locally discard remote results', () => {
  const searches: string[] = [];
  const { rerender } = render(
    <SelectAdapter
      options={options}
      defaultOpen
      searchable
      searchValue="remote"
      filterOption={false}
      onSearch={(next) => searches.push(next)}
    />,
  );
  const input = screen.getByRole('combobox') as HTMLInputElement;
  expect(input.value).toBe('remote');
  expect(screen.getAllByRole('option')).toHaveLength(2);
  fireEvent.change(input, { target: { value: 'next' } });
  expect(searches).toEqual(['next']);
  expect(input.value).toBe('remote');
  rerender(
    <SelectAdapter
      options={options}
      defaultOpen
      searchable
      searchValue="next"
      filterOption={false}
    />,
  );
  expect(input.value).toBe('next');
});

it('opens and searches in a controlled integration then clears search after selection', async () => {
  function Sample() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    return (
      <SelectAdapter
        options={options}
        searchable
        open={open}
        onOpenChange={setOpen}
        searchValue={search}
        onSearch={setSearch}
      />
    );
  }
  render(<Sample />);
  const input = screen.getByRole('combobox') as HTMLInputElement;
  await userEvent.type(input, 'Ann');
  expect(input.value).toBe('Ann');
  await userEvent.click(screen.getByRole('option', { name: 'Anna' }));
  expect(input.value).toBe('Anna');
  expect(screen.queryByRole('listbox')).toBeNull();
  await userEvent.click(input);
  expect(input.value).toBe('');
});

it('announces loading instead of empty results and keeps existing results usable', async () => {
  const { rerender } = render(
    <SelectAdapter options={[]} defaultOpen loading loadingContent="Finding people" />,
  );
  expect(screen.getByRole('listbox').getAttribute('aria-busy')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('Finding people');
  expect(screen.queryByText('Нет вариантов')).toBeNull();
  rerender(<SelectAdapter options={options} defaultOpen loading loadingContent="Finding people" />);
  await userEvent.click(screen.getByRole('option', { name: 'Anna' }));
  expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Anna');
});

it('renders rich options while retaining plain labels for forms and disabled semantics', async () => {
  render(
    <form>
      <SelectAdapter
        name="person"
        options={options}
        defaultOpen
        optionRender={(option, state) => (
          <span>
            {state.active ? 'Active ' : ''}
            {option.label}
            <small> #{option.value}</small>
          </span>
        )}
      />
    </form>,
  );
  const anna = screen.getByRole('option', { name: 'Anna' });
  expect(anna.textContent).toContain('#a');
  expect(screen.getByRole('option', { name: 'Boris' }).getAttribute('aria-disabled')).toBe('true');
  await userEvent.click(screen.getByRole('option', { name: 'Boris' }));
  expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('');
  await userEvent.click(anna);
  const input = screen.getByRole('combobox') as HTMLInputElement;
  expect(input.value).toBe('Anna');
  expect(new FormData(input.closest('form')!).get('person')).toBe('a');
});

it('closes an uncontrolled popup when disabled without reopening on enable', () => {
  const { rerender } = render(<SelectAdapter options={options} defaultOpen />);
  expect(screen.getByRole('combobox').getAttribute('aria-expanded')).toBe('true');
  rerender(<SelectAdapter options={options} defaultOpen disabled />);
  expect(screen.queryByRole('listbox')).toBeNull();
  rerender(<SelectAdapter options={options} defaultOpen />);
  expect(screen.queryByRole('listbox')).toBeNull();
});

it('reports outside dismissal without mutating controlled opening', () => {
  const requests: boolean[] = [];
  render(
    <>
      <SelectAdapter options={options} open onOpenChange={(next) => requests.push(next)} />
      <div>Outside</div>
    </>,
  );
  fireEvent.pointerDown(screen.getByText('Outside'));
  expect(requests).toEqual([false]);
  expect(screen.getByRole('combobox').getAttribute('aria-expanded')).toBe('true');
});

it('reconciles active options when remote results change', () => {
  const { rerender } = render(
    <SelectAdapter options={options} defaultOpen defaultValue="a" filterOption={false} />,
  );
  rerender(
    <SelectAdapter
      options={[{ value: 'c', label: 'Cora' }]}
      defaultOpen
      defaultValue="a"
      filterOption={false}
    />,
  );
  const input = screen.getByRole('combobox') as HTMLInputElement;
  expect(input.value).toBe('a');
  expect(input.getAttribute('aria-activedescendant')).toBe(
    screen.getByRole('option', { name: 'Cora' }).id,
  );
  rerender(<SelectAdapter options={[]} defaultOpen defaultValue="a" filterOption={false} />);
  expect(input.hasAttribute('aria-activedescendant')).toBe(false);
});

it('emits one opening request per click even if the owner rejects it', async () => {
  const requests: boolean[] = [];
  render(
    <SelectAdapter options={options} open={false} onOpenChange={(next) => requests.push(next)} />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  expect(requests).toEqual([true]);
});

it('emits one search reset when selecting with a caller-owned search', async () => {
  const searches: string[] = [];
  render(
    <SelectAdapter
      options={options}
      defaultOpen
      searchable
      searchValue="Ann"
      onSearch={(next) => searches.push(next)}
    />,
  );
  await userEvent.click(screen.getByRole('option', { name: 'Anna' }));
  expect(searches).toEqual(['']);
});

it('does not treat an asynchronous native toggle as a new close request', () => {
  render(<SelectAdapter options={options} defaultOpen />);
  fireEvent(
    screen.getByRole('listbox'),
    Object.assign(new Event('toggle'), { newState: 'closed' }),
  );
  expect(screen.getByRole('combobox').getAttribute('aria-expanded')).toBe('true');
});
