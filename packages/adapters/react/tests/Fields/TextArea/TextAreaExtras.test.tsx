import { createRef, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { TextAreaAdapter } from '../../../src/Fields/TextArea/TextAreaAdapter.tsx';

afterEach(cleanup);

it('clears through onChange without submitting, preserves ref and form data', async () => {
  const ref = createRef<HTMLTextAreaElement>();
  const changes: string[] = [];
  let submits = 0;
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submits++;
      }}
    >
      <TextAreaAdapter
        ref={ref}
        aria-label="Notes"
        name="notes"
        defaultValue="Hello"
        allowClear
        showCount
        maxLength={20}
        onChange={(event) => changes.push(event.currentTarget.value)}
      />
    </form>,
  );
  expect(screen.getByText('5 / 20')).toBeTruthy();
  await userEvent.click(screen.getByRole('button', { name: 'Clear input' }));
  expect(ref.current?.value).toBe('');
  expect(document.activeElement).toBe(ref.current);
  expect(changes).toEqual(['']);
  expect(submits).toBe(0);
  expect(new FormData(ref.current!.form!).get('notes')).toBe('');
  expect(screen.getByText('0 / 20')).toBeTruthy();
});

it.each([true, false])('respects controlled ownership when accepted=%s', async (accepted) => {
  const changes: string[] = [];
  function Demo() {
    const [value, setValue] = useState('Hello');
    return (
      <TextAreaAdapter
        aria-label="Notes"
        value={value}
        allowClear
        showCount
        onChange={(event) => {
          changes.push(event.currentTarget.value);
          if (accepted) setValue(event.currentTarget.value);
        }}
      />
    );
  }
  render(<Demo />);
  await userEvent.click(screen.getByRole('button', { name: 'Clear input' }));
  expect(changes).toEqual(['']);
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(accepted ? '' : 'Hello');
  expect(screen.getByText(accepted ? '0' : '5')).toBeTruthy();
});

it('counts input and native reset but respects cancelled reset', async () => {
  render(
    <form>
      <TextAreaAdapter aria-label="Notes" defaultValue="A" showCount />
    </form>,
  );
  const area = screen.getByRole('textbox') as HTMLTextAreaElement;
  await userEvent.type(area, 'BC');
  expect(screen.getByText('3')).toBeTruthy();
  const cancel = (event: Event) => event.preventDefault();
  area.form!.addEventListener('reset', cancel);
  await act(async () => area.form!.reset());
  expect(screen.getByText('3')).toBeTruthy();
  area.form!.removeEventListener('reset', cancel);
  await act(async () => area.form!.reset());
  expect(screen.getByText('1')).toBeTruthy();
});

it.each([{ disabled: true }, { readOnly: true }])('does not offer clearing for %j', (props) => {
  render(<TextAreaAdapter aria-label="Notes" defaultValue="Hello" allowClear {...props} />);
  expect(screen.queryByRole('button', { name: 'Clear input' })).toBeNull();
});

it('blocks clearing inside a disabled fieldset', () => {
  render(
    <fieldset disabled>
      <TextAreaAdapter aria-label="Notes" defaultValue="Hello" allowClear />
    </fieldset>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Hello');
});

it('shrinks autoSize after clearing', async () => {
  render(
    <TextAreaAdapter
      aria-label="Notes"
      defaultValue="Hello"
      allowClear
      showCount
      autoSize
      rows={1}
      style={{ lineHeight: '20px', padding: 0, border: 0, boxSizing: 'content-box' }}
      ref={(node) => {
        if (node)
          Object.defineProperty(node, 'scrollHeight', {
            configurable: true,
            get: () => (node.value ? 80 : 20),
          });
      }}
    />,
  );
  const area = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect(area.style.height).toBe('80px');
  await userEvent.click(screen.getByRole('button', { name: 'Clear input' }));
  expect(area.style.height).toBe('20px');
});

it('keeps the native field and draft when extra controls are toggled', async () => {
  const { rerender } = render(<TextAreaAdapter aria-label="Notes" defaultValue="A" />);
  const area = screen.getByRole('textbox');
  await userEvent.type(area, 'BC');
  rerender(<TextAreaAdapter aria-label="Notes" defaultValue="A" allowClear showCount />);
  expect(screen.getByRole('textbox')).toBe(area);
  expect((area as HTMLTextAreaElement).value).toBe('ABC');
  expect(screen.getByText('3')).toBeTruthy();
});
