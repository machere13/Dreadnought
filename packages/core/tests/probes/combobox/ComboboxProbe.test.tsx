import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { ComboboxProbe } from './ComboboxProbe.tsx';

afterEach(cleanup);
const options = [
  { value: 'ada', label: 'Ada' },
  { value: 'alan', label: 'Alan', disabled: true },
  { value: 'grace', label: 'Grace' },
];
const input = () => screen.getByRole('combobox') as HTMLInputElement;
const active = () => input().ownerDocument.getElementById(input().getAttribute('aria-activedescendant') ?? '')?.textContent;

it('keeps option IDs separate from the input and list even for matching values', async () => {
  render(<ComboboxProbe options={[{ value: 'input', label: 'Input option' }, { value: 'list', label: 'List option' }]} />);
  await userEvent.click(input());
  expect(document.getElementById(input().getAttribute('aria-activedescendant')!)?.getAttribute('role')).toBe('option');
  expect(active()).toBe('Input option');
  await userEvent.keyboard('{ArrowDown}');
  expect(document.getElementById(input().getAttribute('aria-activedescendant')!)?.getAttribute('role')).toBe('option');
  expect(active()).toBe('List option');
  expect(document.getElementById(input().getAttribute('aria-controls')!)?.getAttribute('role')).toBe('listbox');
});

it('filters by typed text and commits the visible option without submitting the form', async () => {
  const submit = vi.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><ComboboxProbe options={options} /></form>);
  await userEvent.type(input(), 'GR');
  expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Grace']);
  expect(active()).toBe('Grace');
  await userEvent.keyboard('{Enter}');
  expect(input().value).toBe('Grace');
  expect(screen.getByRole('status').textContent).toBe('grace');
  expect(input().getAttribute('aria-expanded')).toBe('false');
  expect(document.activeElement).toBe(input());
  expect(submit).not.toHaveBeenCalled();
});

it('skips disabled choices, stops at boundaries and leaves text cursor keys alone', async () => {
  render(<ComboboxProbe options={options} />);
  await userEvent.click(input());
  expect(active()).toBe('Ada');
  await userEvent.keyboard('{ArrowDown}');
  expect(active()).toBe('Grace');
  await userEvent.keyboard('{ArrowDown}');
  expect(active()).toBe('Grace');
  await userEvent.keyboard('{ArrowUp}');
  expect(active()).toBe('Ada');
  await userEvent.keyboard('{ArrowUp}');
  expect(active()).toBe('Ada');
  expect(fireEvent.keyDown(input(), { key: 'Home' })).toBe(true);
  expect(fireEvent.keyDown(input(), { key: 'End' })).toBe(true);
  expect(fireEvent.keyDown(input(), { key: 'ArrowLeft' })).toBe(true);
});

it('discards the search draft on Escape without changing the committed value', async () => {
  render(<ComboboxProbe options={options} defaultValue="ada" />);
  await userEvent.type(input(), 'gr');
  await userEvent.keyboard('{Escape}');
  expect(input().value).toBe('Ada');
  expect(screen.getByRole('status').textContent).toBe('ada');
  expect(input().hasAttribute('aria-activedescendant')).toBe(false);
  expect(document.activeElement).toBe(input());
});

it('closes on Tab without stealing the next field focus or committing the draft', async () => {
  render(<><ComboboxProbe options={options} defaultValue="ada" /><button>Outside</button></>);
  await userEvent.type(input(), 'gr');
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
  expect(input().getAttribute('aria-expanded')).toBe('false');
  expect(input().value).toBe('Ada');
});

it('does not choose missing matches or disabled options', async () => {
  render(<ComboboxProbe options={options} />);
  await userEvent.type(input(), 'missing');
  expect(screen.queryByRole('option')).toBe(null);
  expect(input().hasAttribute('aria-activedescendant')).toBe(false);
  await userEvent.keyboard('{Enter}');
  expect(screen.getByRole('status').textContent).toBe('');
  await userEvent.clear(input());
  await userEvent.click(screen.getByRole('option', { name: 'Alan' }));
  expect(screen.getByRole('status').textContent).toBe('');
  await userEvent.click(screen.getByRole('option', { name: 'Grace' }));
  expect(input().value).toBe('Grace');
  expect(document.activeElement).toBe(input());
});

it('ignores composing and consumer-cancelled keyboard events', async () => {
  const view = (cancel: boolean) => <ComboboxProbe options={options}
    onKeyDown={cancel ? (event: React.KeyboardEvent<HTMLInputElement>) => event.preventDefault() : undefined} />;
  const { rerender } = render(view(false));
  await userEvent.click(input());
  fireEvent.keyDown(input(), { key: 'ArrowDown', isComposing: true });
  fireEvent.keyDown(input(), { key: 'Enter', isComposing: true });
  expect(active()).toBe('Ada');
  expect(screen.getByRole('status').textContent).toBe('');
  rerender(view(true));
  await userEvent.keyboard('{ArrowDown}{Enter}{Escape}');
  expect(active()).toBe('Ada');
  expect(input().getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('');
});

it('does not open a disabled field and gives two instances separate ARIA targets', async () => {
  const { unmount } = render(<ComboboxProbe options={options} disabled />);
  await userEvent.click(input());
  expect(input().disabled).toBe(true);
  expect(input().getAttribute('aria-expanded')).toBe('false');
  unmount();
  render(<><ComboboxProbe options={options} /><ComboboxProbe options={options} /></>);
  const controls = screen.getAllByRole('combobox');
  expect(new Set(controls.map(control => control.getAttribute('aria-controls'))).size).toBe(2);
  for (const control of controls) {
    expect(document.getElementById(control.getAttribute('aria-controls')!)?.getAttribute('role')).toBe('listbox');
  }
});
