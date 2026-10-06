import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useMarkdownEditor } from '../../../src/Fields/MarkdownEditor/index.ts';
import type { UseMarkdownEditorOptions, UseMarkdownEditorResult } from '../../../src/Fields/MarkdownEditor/index.ts';

afterEach(cleanup);
let editor: UseMarkdownEditorResult;
function Editor(options: UseMarkdownEditorOptions & { fieldKey?: string }) {
  const { fieldKey, ...props } = options;
  editor = useMarkdownEditor(props);
  return <><textarea key={fieldKey} aria-label="Editor" {...editor.textAreaProps} ref={editor.textAreaRef} />
    <button onClick={() => editor.execute({ type: 'bold' })}>Bold</button></>;
}
const field = () => screen.getByLabelText('Editor') as HTMLTextAreaElement;
function select(start: number, end: number) { field().setSelectionRange(start, end); fireEvent.select(field()); }

it('formats selected text and restores selection and focus after commit', () => {
  render(<Editor defaultValue="hello" />);
  select(0, 5);
  fireEvent.click(screen.getByText('Bold'));
  expect(field().value).toBe('**hello**');
  expect([field().selectionStart, field().selectionEnd]).toEqual([2, 7]);
  expect(document.activeElement).toBe(field());
});

it('uses the latest uncontrolled result for batched commands', () => {
  render(<Editor defaultValue="hello" />);
  select(0, 5);
  act(() => { editor.execute({ type: 'bold' }); editor.execute({ type: 'italic' }); });
  expect(field().value).toBe('***hello***');
  expect([field().selectionStart, field().selectionEnd]).toEqual([3, 8]);
});

it('does not speculate on controlled acceptance inside one batch', () => {
  function Controlled() {
    const [value, setValue] = useState('hello');
    return <Editor value={value} onValueChange={setValue} />;
  }
  render(<Controlled />);
  select(0, 5);
  act(() => { editor.execute({ type: 'bold' }); editor.execute({ type: 'italic' }); });
  expect(field().value).toBe('*hello*');
  expect([field().selectionStart, field().selectionEnd]).toEqual([1, 6]);
});

it('propagates core validation errors without partially updating text', () => {
  render(<Editor defaultValue="hello" />);
  select(0, 5);
  expect(() => act(() => editor.execute({ type: 'heading', level: 7 as 1 }))).toThrow(RangeError);
  expect(field().value).toBe('hello');
});

it('accepts controlled changes synchronously', () => {
  function Controlled() {
    const [value, setValue] = useState('hello');
    return <Editor value={value} onValueChange={setValue} />;
  }
  render(<Controlled />);
  select(0, 5);
  fireEvent.click(screen.getByText('Bold'));
  expect(field().value).toBe('**hello**');
  expect([field().selectionStart, field().selectionEnd]).toEqual([2, 7]);
});

it('does not restore stale selection or focus after controlled refusal', () => {
  const onValueChange = vi.fn();
  const view = render(<Editor value="hello" onValueChange={onValueChange} />);
  select(0, 5);
  const button = screen.getByText('Bold');
  button.focus();
  fireEvent.click(button);
  expect(field().value).toBe('hello');
  expect(document.activeElement).toBe(button);
  expect(onValueChange).toHaveBeenCalledWith('**hello**');
  view.rerender(<Editor value="**hello**" onValueChange={onValueChange} />);
  expect(document.activeElement).toBe(button);
  expect([field().selectionStart, field().selectionEnd]).not.toEqual([2, 7]);
});

it('does not steal focus when the owner transforms or externally changes value', () => {
  function Controlled() {
    const [value, setValue] = useState('hello');
    return <Editor value={value} onValueChange={next => setValue(next.toUpperCase())} />;
  }
  render(<Controlled />);
  select(0, 5);
  const button = screen.getByText('Bold');
  button.focus();
  fireEvent.click(button);
  expect(field().value).toBe('**HELLO**');
  expect(document.activeElement).toBe(button);
});

it('notifies actual input but not selection or external normalization', () => {
  const onChange = vi.fn();
  const onValueChange = vi.fn();
  render(<Editor defaultValue={'a\r\nb\rc'} onChange={onChange} onValueChange={onValueChange} />);
  expect(field().value).toBe('a\nb\nc');
  select(0, 1);
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.change(field(), { target: { value: 'world' } });
  expect(field().value).toBe('world');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith('world');
});

it('honors cancelled input and ignores changed defaultValue after mount', () => {
  const onValueChange = vi.fn();
  const onChange: UseMarkdownEditorOptions['onChange'] = event => event.preventDefault();
  const view = render(<Editor defaultValue="hello" onChange={onChange} onValueChange={onValueChange} />);
  fireEvent.change(field(), { target: { value: 'world' } });
  expect(field().value).toBe('hello');
  expect(onValueChange).not.toHaveBeenCalled();
  view.rerender(<Editor defaultValue="other" onChange={onChange} />);
  expect(field().value).toBe('hello');
});

it.each(['disabled', 'readOnly'] as const)('blocks commands when %s', mode => {
  const onValueChange = vi.fn();
  render(<Editor defaultValue="hello" {...{ [mode]: true }} onValueChange={onValueChange} />);
  select(0, 5);
  act(() => editor.execute({ type: 'bold' }));
  expect(field().value).toBe('hello');
  expect(onValueChange).not.toHaveBeenCalled();
});

it.each([
  [{ key: 'b', ctrlKey: true }, '**hello**', 2, 7],
  [{ key: 'i', metaKey: true }, '*hello*', 1, 6],
  [{ key: 'e', ctrlKey: true }, '`hello`', 1, 6],
  [{ key: 'X', metaKey: true, shiftKey: true }, '~~hello~~', 2, 7],
  [{ key: ']', ctrlKey: true }, '  hello', 2, 7],
  [{ key: '[', metaKey: true }, 'hello', 0, 5],
])('runs keyboard command %j', (keys, value, start, end) => {
  render(<Editor defaultValue="hello" />);
  select(0, 5);
  expect(fireEvent.keyDown(field(), keys)).toBe(false);
  expect(field().value).toBe(value);
  expect([field().selectionStart, field().selectionEnd]).toEqual([start, end]);
});

it('continues lists on Enter but keeps Tab, modified keys and undo native', () => {
  render(<Editor defaultValue="1. a" />);
  select(4, 4);
  expect(fireEvent.keyDown(field(), { key: 'Enter' })).toBe(false);
  expect(field().value).toBe('1. a\n2. ');
  expect(field().selectionStart).toBe(8);
  for (const keys of [{ key: 'Tab' }, { key: 'Enter', shiftKey: true }, { key: 'b', altKey: true, ctrlKey: true }, { key: 'b', ctrlKey: true, metaKey: true }, { key: 'z', ctrlKey: true }]) {
    expect(fireEvent.keyDown(field(), keys)).toBe(true);
  }
});

it('honors keyboard cancellation and active IME composition', () => {
  const view = render(<Editor defaultValue="hello" onKeyDown={event => event.preventDefault()} />);
  select(0, 5);
  fireEvent.keyDown(field(), { key: 'b', ctrlKey: true });
  expect(field().value).toBe('hello');
  view.rerender(<Editor defaultValue="hello" />);
  fireEvent.compositionStart(field());
  act(() => editor.execute({ type: 'bold' }));
  expect(fireEvent.keyDown(field(), { key: 'Enter' })).toBe(true);
  expect(field().value).toBe('hello');
  fireEvent.compositionEnd(field());
  expect(fireEvent.keyDown(field(), { key: 'Enter', keyCode: 229 })).toBe(true);
  expect(fireEvent.keyDown(field(), { key: 'b', ctrlKey: true, isComposing: true })).toBe(true);
  expect(field().value).toBe('hello');
  fireEvent.keyDown(field(), { key: 'b', ctrlKey: true });
  expect(field().value).toBe('**hello**');
});

it('preserves UTF-16 offsets', () => {
  render(<Editor defaultValue="a😀b" />);
  select(1, 3);
  act(() => editor.execute({ type: 'italic' }));
  expect(field().value).toBe('a*😀*b');
  expect([field().selectionStart, field().selectionEnd]).toEqual([2, 4]);
});

it('resets uncontrolled to the initial default without notification', async () => {
  const onValueChange = vi.fn();
  render(<form aria-label="Form"><Editor defaultValue="hello" onValueChange={onValueChange} /></form>);
  fireEvent.change(field(), { target: { value: 'world' } });
  onValueChange.mockClear();
  await act(async () => (screen.getByLabelText('Form') as HTMLFormElement).reset());
  expect(field().value).toBe('hello');
  expect(onValueChange).not.toHaveBeenCalled();
});

it('honors cancelled reset and leaves controlled reset to its owner', async () => {
  const view = render(<form aria-label="Form" onReset={event => event.preventDefault()}><Editor defaultValue="hello" /></form>);
  fireEvent.change(field(), { target: { value: 'world' } });
  await act(async () => (screen.getByLabelText('Form') as HTMLFormElement).reset());
  expect(field().value).toBe('world');
  view.rerender(<form aria-label="Form"><Editor value="owned" /></form>);
  await act(async () => (screen.getByLabelText('Form') as HTMLFormElement).reset());
  expect(field().value).toBe('owned');
});

it('does not apply a pending result to a replaced or unmounted field', () => {
  const view = render(<Editor defaultValue="hello" fieldKey="one" />);
  select(0, 5);
  const oldField = field();
  act(() => { editor.execute({ type: 'bold' }); view.rerender(<Editor defaultValue="hello" fieldKey="two" />); });
  expect(document.activeElement).not.toBe(field());
  expect(oldField.isConnected).toBe(false);
  view.unmount();
  expect(() => editor.execute({ type: 'bold' })).not.toThrow();
});
