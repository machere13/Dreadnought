import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { InputAdapter } from '../../../src/Fields/Input/InputAdapter.tsx';

afterEach(cleanup);

it('renders interactive affixes without forwarding them to the native input', async () => {
  let clicks = 0;
  render(
    <InputAdapter
      aria-label="Amount"
      prefix="₽"
      suffix={<button onClick={() => clicks++}>Apply</button>}
    />,
  );
  expect(screen.getByText('₽').getAttribute('data-slot')).toBe('prefix');
  await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
  expect(clicks).toBe(1);
  expect(screen.getByRole('textbox').hasAttribute('prefix')).toBe(false);
  expect(screen.getByRole('textbox').hasAttribute('suffix')).toBe(false);
});

it('clears through input events, keeps form data and returns focus without submitting', async () => {
  const changes: string[] = [];
  let submits = 0;
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submits++;
      }}
    >
      <InputAdapter
        aria-label="Name"
        name="name"
        defaultValue="Anna"
        allowClear
        showCount
        maxLength={10}
        onChange={(event) => changes.push(event.currentTarget.value)}
      />
    </form>,
  );
  const input = screen.getByRole('textbox') as HTMLInputElement;
  expect(screen.getByText('4 / 10')).toBeTruthy();
  await userEvent.click(screen.getByRole('button', { name: 'Clear input' }));
  expect(input.value).toBe('');
  expect(changes).toEqual(['']);
  expect(new FormData(input.form!).get('name')).toBe('');
  expect(document.activeElement).toBe(input);
  expect(submits).toBe(0);
  expect(screen.getByText('0 / 10')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Clear input' })).toBeNull();
});

it.each([true, false])('preserves controlled ownership when accepted=%s', async (accept) => {
  const changes: string[] = [];
  function Demo() {
    const [value, setValue] = useState('Anna');
    return (
      <InputAdapter
        aria-label="Name"
        value={value}
        allowClear
        showCount
        onChange={(event) => {
          changes.push(event.currentTarget.value);
          if (accept) setValue(event.currentTarget.value);
        }}
      />
    );
  }
  render(<Demo />);
  await userEvent.click(screen.getByRole('button', { name: 'Clear input' }));
  expect(changes).toEqual(['']);
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(accept ? '' : 'Anna');
  expect(screen.getByText(accept ? '0' : '4')).toBeTruthy();
});

it('updates the count on typing and native reset, including cancelled reset', async () => {
  render(
    <form>
      <InputAdapter aria-label="Name" defaultValue="A" showCount allowClear />
    </form>,
  );
  const input = screen.getByRole('textbox') as HTMLInputElement;
  await userEvent.type(input, 'BC');
  expect(screen.getByText('3')).toBeTruthy();
  const cancel = (event: Event) => event.preventDefault();
  input.form!.addEventListener('reset', cancel);
  await act(async () => input.form!.reset());
  expect(screen.getByText('3')).toBeTruthy();
  input.form!.removeEventListener('reset', cancel);
  await act(async () => input.form!.reset());
  expect(screen.getByText('1')).toBeTruthy();
});

it.each([{ disabled: true }, { readOnly: true }])(
  'hides clearing when editing is forbidden: %j',
  (props) => {
    render(<InputAdapter aria-label="Name" defaultValue="Anna" allowClear {...props} />);
    expect(screen.queryByRole('button', { name: 'Clear input' })).toBeNull();
  },
);

it('does not bypass an inherited disabled fieldset', () => {
  render(
    <fieldset disabled>
      <InputAdapter aria-label="Name" defaultValue="Anna" allowClear />
    </fieldset>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Anna');
});

it('counts UTF-16 units to match native maxLength, and follows controlled updates', () => {
  const { rerender } = render(
    <InputAdapter aria-label="Name" value="😀" readOnly showCount maxLength={4} />,
  );
  expect(screen.getByText('2 / 4')).toBeTruthy();
  rerender(<InputAdapter aria-label="Name" value="hello" readOnly showCount maxLength={4} />);
  expect(screen.getByText('5 / 4')).toBeTruthy();
});

it('keeps numerical steps and clearing in sync with the count', async () => {
  render(<InputAdapter aria-label="Amount" type="number" defaultValue="9" allowClear showCount />);
  await userEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(screen.getByText('2')).toBeTruthy();
  await userEvent.click(screen.getByRole('button', { name: 'Clear input' }));
  expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('');
  expect(screen.getByText('0')).toBeTruthy();
});
