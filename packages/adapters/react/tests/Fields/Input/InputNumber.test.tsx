import { createRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { InputAdapter } from '../../../src/Fields/Input/InputAdapter.tsx';
import { useInput } from '../../../src/Fields/Input/useInput.ts';

afterEach(cleanup);

it('steps within the native decimal grid and emits change only when the value changes', async () => {
  const changes: string[] = [];
  const ref = createRef<HTMLInputElement>();
  render(
    <form>
      <InputAdapter
        type="number"
        aria-label="Quantity"
        ref={ref}
        name="quantity"
        defaultValue="0.2"
        min={0}
        max={0.4}
        step={0.1}
        onChange={(event) => changes.push(event.currentTarget.value)}
      />
    </form>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(ref.current?.value).toBe('0.3');
  expect(document.activeElement).toBe(ref.current);
  await userEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  await userEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(ref.current?.value).toBe('0.4');
  expect(changes).toEqual(['0.3', '0.4']);
  expect(new FormData(ref.current!.form!).get('quantity')).toBe('0.4');
  ref.current!.form!.reset();
  expect(ref.current?.value).toBe('0.2');
});

it('updates controlled values through the ordinary input onChange', async () => {
  function Demo() {
    const [value, setValue] = useState('1');
    return (
      <InputAdapter
        type="number"
        aria-label="Quantity"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
    );
  }
  render(<Demo />);
  await userEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('2');
});

it('does not change a controlled value when the consumer refuses the update', async () => {
  const changes: string[] = [];
  render(
    <InputAdapter
      type="number"
      aria-label="Quantity"
      value="1"
      onChange={(event) => changes.push(event.currentTarget.value)}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(changes).toEqual(['2']);
  expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('1');
});

it('steps an empty field without treating an empty required value as zero beforehand', async () => {
  render(<InputAdapter type="number" aria-label="Quantity" required min={5} max={10} />);
  const input = screen.getByRole('spinbutton') as HTMLInputElement;
  expect(input.value).toBe('');
  expect(input.checkValidity()).toBe(false);
  await userEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(input.value).toBe('5');
  expect(input.checkValidity()).toBe(true);
});

it.each([{ disabled: true }, { readOnly: true }])(
  'keeps step controls inert for %j',
  async (props) => {
    render(<InputAdapter type="number" aria-label="Quantity" defaultValue="1" {...props} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(screen.getByRole('button', { name: 'Increase value' }).hasAttribute('disabled')).toBe(
      true,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Increase value' }));
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('1');
  },
);

it('does not bypass a disabled fieldset through keyboard handlers', () => {
  render(
    <fieldset disabled>
      <InputAdapter type="number" aria-label="Quantity" defaultValue="1" />
    </fieldset>,
  );
  const input = screen.getByRole('spinbutton') as HTMLInputElement;
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.value).toBe('1');
});

it('handles vertical arrows but respects cancellation, modifiers and composition', () => {
  const { rerender } = render(
    <InputAdapter type="number" aria-label="Quantity" defaultValue="1" />,
  );
  const input = screen.getByRole('spinbutton') as HTMLInputElement;
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.value).toBe('2');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  expect(input.value).toBe('1');
  fireEvent.keyDown(input, { key: 'ArrowUp', ctrlKey: true });
  fireEvent.keyDown(input, { key: 'ArrowUp', isComposing: true });
  fireEvent.keyDown(input, { key: 'ArrowLeft' });
  expect(input.value).toBe('1');
  rerender(
    <InputAdapter
      type="number"
      aria-label="Quantity"
      defaultValue="1"
      onKeyDown={(event) => event.preventDefault()}
    />,
  );
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.value).toBe('1');
});

it('keeps arbitrary steps editable without unsupported native step commands', () => {
  render(<InputAdapter type="number" aria-label="Quantity" step="any" defaultValue="0.12" />);
  expect(screen.queryByRole('button')).toBeNull();
  fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' });
  expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('0.12');
});

it('exposes numerical stepping through useInput without styles', async () => {
  function Demo() {
    const { inputProps, stepButtonProps } = useInput({
      type: 'number',
      defaultValue: '3',
      'aria-label': 'Quantity',
    });
    return (
      <>
        <input {...inputProps} />
        <button {...stepButtonProps?.decrease} />
        <button {...stepButtonProps?.increase} />
      </>
    );
  }
  render(<Demo />);
  await userEvent.click(screen.getByRole('button', { name: 'Decrease value' }));
  expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('2');
  expect(screen.getByRole('button', { name: 'Decrease value' }).className).toBe('');
});
