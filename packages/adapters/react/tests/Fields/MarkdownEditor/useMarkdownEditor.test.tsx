import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useMarkdownEditor } from '../../../src/Fields/MarkdownEditor/index.ts';
import type {
  UseMarkdownEditorOptions,
  UseMarkdownEditorResult,
} from '../../../src/Fields/MarkdownEditor/index.ts';

afterEach(cleanup);
let editor: UseMarkdownEditorResult;
function Editor(options: UseMarkdownEditorOptions & { fieldKey?: string }) {
  const { fieldKey, ...props } = options;
  editor = useMarkdownEditor(props);
  return (
    <>
      <textarea
        key={fieldKey}
        aria-label="Editor"
        {...editor.textAreaProps}
        ref={editor.textAreaRef}
      />
      <button onClick={() => editor.execute({ type: 'bold' })}>Bold</button>
    </>
  );
}
const field = () => screen.getByLabelText('Editor') as HTMLTextAreaElement;
function select(start: number, end: number) {
  field().setSelectionRange(start, end);
  fireEvent.select(field());
}

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
  act(() => {
    editor.execute({ type: 'bold' });
    editor.execute({ type: 'italic' });
  });
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
  act(() => {
    editor.execute({ type: 'bold' });
    editor.execute({ type: 'italic' });
  });
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
    return <Editor value={value} onValueChange={(next) => setValue(next.toUpperCase())} />;
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
  const onChange: UseMarkdownEditorOptions['onChange'] = (event) => event.preventDefault();
  const view = render(
    <Editor defaultValue="hello" onChange={onChange} onValueChange={onValueChange} />,
  );
  fireEvent.change(field(), { target: { value: 'world' } });
  expect(field().value).toBe('hello');
  expect(onValueChange).not.toHaveBeenCalled();
  view.rerender(<Editor defaultValue="other" onChange={onChange} />);
  expect(field().value).toBe('hello');
});

it.each(['disabled', 'readOnly'] as const)('blocks commands when %s', (mode) => {
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

it('continues lists on Enter but keeps Tab and modified keys native', () => {
  render(<Editor defaultValue="1. a" />);
  select(4, 4);
  expect(fireEvent.keyDown(field(), { key: 'Enter' })).toBe(false);
  expect(field().value).toBe('1. a\n2. ');
  expect(field().selectionStart).toBe(8);
  for (const keys of [
    { key: 'Tab' },
    { key: 'Enter', shiftKey: true },
    { key: 'b', altKey: true, ctrlKey: true },
    { key: 'b', ctrlKey: true, metaKey: true },
  ]) {
    expect(fireEvent.keyDown(field(), keys)).toBe(true);
  }
});

it('undoes input and formatting together with the original cursor', () => {
  render(<Editor defaultValue="hello" />);
  fireEvent.change(field(), { target: { value: 'hello😀' } });
  select(5, 7);
  act(() => editor.execute({ type: 'bold' }));
  expect(field().value).toBe('hello**😀**');
  expect(fireEvent.keyDown(field(), { key: 'z', ctrlKey: true })).toBe(false);
  expect(field().value).toBe('hello😀');
  expect([field().selectionStart, field().selectionEnd]).toEqual([5, 7]);
  act(() => editor.undo());
  expect(field().value).toBe('hello');
  act(() => editor.redo());
  expect(field().value).toBe('hello😀');
  act(() => editor.redo());
  expect(field().value).toBe('hello**😀**');
});

it('does not advance history after controlled refusal and resets on external value', () => {
  const view = render(<Editor value="hello" />);
  select(0, 5);
  act(() => editor.execute({ type: 'bold' }));
  expect(editor.canUndo).toBe(false);
  view.rerender(<Editor value="external" />);
  expect(editor.canUndo).toBe(false);
});

it('keeps controlled undo stacks until the owner accepts', () => {
  let reject = false;
  function Controlled() {
    const [value, setValue] = useState('hello');
    return (
      <Editor
        value={value}
        onValueChange={(next) => {
          if (!reject) {
            setValue(next);
          }
        }}
      />
    );
  }
  render(<Controlled />);
  select(0, 5);
  act(() => editor.execute({ type: 'bold' }));
  reject = true;
  act(() => editor.undo());
  expect(field().value).toBe('**hello**');
  expect(editor.canUndo).toBe(true);
  expect(editor.canRedo).toBe(false);
  reject = false;
  act(() => editor.undo());
  expect(field().value).toBe('hello');
  expect(editor.canRedo).toBe(true);
});

it('coalesces continuous typing and breaks the group on paste or cursor movement', () => {
  render(<Editor />);
  fireEvent.input(field(), {
    target: { value: 'a', selectionStart: 1, selectionEnd: 1 },
    inputType: 'insertText',
  });
  fireEvent.input(field(), {
    target: { value: 'ab', selectionStart: 2, selectionEnd: 2 },
    inputType: 'insertText',
  });
  act(() => editor.undo());
  expect(field().value).toBe('');
  act(() => editor.redo());
  fireEvent.input(field(), {
    target: { value: 'abc', selectionStart: 3, selectionEnd: 3 },
    inputType: 'insertFromPaste',
  });
  act(() => editor.undo());
  expect(field().value).toBe('ab');
  select(0, 0);
  fireEvent.input(field(), {
    target: { value: 'xab', selectionStart: 1, selectionEnd: 1 },
    inputType: 'insertText',
  });
  act(() => editor.undo());
  expect(field().value).toBe('ab');
});

it('records IME as one step and clears redo after batched new commands', () => {
  render(<Editor />);
  fireEvent.compositionStart(field());
  fireEvent.input(field(), { target: { value: 'に' }, inputType: 'insertCompositionText' });
  fireEvent.input(field(), { target: { value: '日本' }, inputType: 'insertCompositionText' });
  act(() => editor.undo());
  expect(field().value).toBe('日本');
  fireEvent.compositionEnd(field());
  fireEvent.input(field(), { target: { value: '日本' }, inputType: 'insertText' });
  act(() => editor.undo());
  expect(field().value).toBe('');
  act(() => {
    editor.execute({ type: 'bold' });
    editor.execute({ type: 'italic' });
  });
  expect(editor.canRedo).toBe(false);
  act(() => editor.undo());
  expect(field().value).toBe('****');
});

it('coalesces the final changed input after compositionend with its IME step', () => {
  render(<Editor />);
  fireEvent.compositionStart(field());
  fireEvent.input(field(), { target: { value: 'に' }, inputType: 'insertCompositionText' });
  fireEvent.compositionEnd(field(), { data: '日本' });
  fireEvent.input(field(), { target: { value: '日本' }, inputType: 'insertText' });
  act(() => editor.undo());
  expect(field().value).toBe('');
  expect(editor.canUndo).toBe(false);
  act(() => editor.redo());
  expect(field().value).toBe('日本');
});

it('starts a separate typing step after the final composition input', async () => {
  render(<Editor />);
  fireEvent.compositionStart(field());
  fireEvent.input(field(), { target: { value: 'a' }, inputType: 'insertCompositionText' });
  fireEvent.compositionEnd(field(), { data: 'ab' });
  fireEvent.input(field(), { target: { value: 'ab' }, inputType: 'insertText' });
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.input(field(), { target: { value: 'abc' }, inputType: 'insertText' });
  act(() => editor.undo());
  expect(field().value).toBe('ab');
  act(() => editor.undo());
  expect(field().value).toBe('');
});

it('creates an IME step only after the controlled owner accepts a proposal', () => {
  function Controlled() {
    const [value, setValue] = useState('');
    return (
      <Editor
        value={value}
        onValueChange={(next) => {
          if (next !== 'に') {
            setValue(next);
          }
        }}
      />
    );
  }
  render(<Controlled />);
  fireEvent.compositionStart(field());
  fireEvent.input(field(), { target: { value: 'に' }, inputType: 'insertCompositionText' });
  expect(field().value).toBe('');
  fireEvent.input(field(), { target: { value: '日本' }, inputType: 'insertCompositionText' });
  fireEvent.compositionEnd(field(), { data: '日本' });
  act(() => editor.undo());
  expect(field().value).toBe('');
  expect(editor.canUndo).toBe(false);
});

it('routes native beforeinput history and respects consumer cancellation', () => {
  let cancel = false;
  const handler = vi.fn<NonNullable<UseMarkdownEditorOptions['onBeforeInput']>>((event) => {
    if (cancel) {
      event.preventDefault();
    }
  });
  render(<Editor defaultValue="hello" onBeforeInput={handler} />);
  select(0, 5);
  act(() => editor.execute({ type: 'bold' }));
  const undo = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'historyUndo',
  });
  fireEvent(field(), undo);
  expect(undo.defaultPrevented).toBe(true);
  expect(field().value).toBe('hello');
  cancel = true;
  fireEvent(
    field(),
    new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'historyRedo' }),
  );
  expect(field().value).toBe('hello');
  expect(handler).toHaveBeenCalledTimes(2);
});

it('splits typing after 500 milliseconds and limits history', () => {
  const clock = vi.spyOn(Date, 'now');
  render(<Editor historyLimit={1} />);
  clock.mockReturnValue(0);
  fireEvent.input(field(), { target: { value: 'a' }, inputType: 'insertText' });
  clock.mockReturnValue(501);
  fireEvent.input(field(), { target: { value: 'ab' }, inputType: 'insertText' });
  act(() => editor.undo());
  expect(field().value).toBe('a');
  expect(editor.canUndo).toBe(false);
  expect(fireEvent.keyDown(field(), { key: 'z', metaKey: true })).toBe(false);
  clock.mockRestore();
});

it('honors keyboard cancellation and active IME composition', () => {
  const view = render(
    <Editor defaultValue="hello" onKeyDown={(event) => event.preventDefault()} />,
  );
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
  render(
    <form aria-label="Form">
      <Editor defaultValue="hello" onValueChange={onValueChange} />
    </form>,
  );
  fireEvent.change(field(), { target: { value: 'world' } });
  onValueChange.mockClear();
  await act(async () => (screen.getByLabelText('Form') as HTMLFormElement).reset());
  expect(field().value).toBe('hello');
  expect(onValueChange).not.toHaveBeenCalled();
});

it('honors cancelled reset and leaves controlled reset to its owner', async () => {
  const view = render(
    <form aria-label="Form" onReset={(event) => event.preventDefault()}>
      <Editor defaultValue="hello" />
    </form>,
  );
  fireEvent.change(field(), { target: { value: 'world' } });
  await act(async () => (screen.getByLabelText('Form') as HTMLFormElement).reset());
  expect(field().value).toBe('world');
  view.rerender(
    <form aria-label="Form">
      <Editor value="owned" />
    </form>,
  );
  await act(async () => (screen.getByLabelText('Form') as HTMLFormElement).reset());
  expect(field().value).toBe('owned');
});

it('does not apply a pending result to a replaced or unmounted field', () => {
  const view = render(<Editor defaultValue="hello" fieldKey="one" />);
  select(0, 5);
  const oldField = field();
  act(() => {
    editor.execute({ type: 'bold' });
    view.rerender(<Editor defaultValue="hello" fieldKey="two" />);
  });
  expect(document.activeElement).not.toBe(field());
  expect(oldField.isConnected).toBe(false);
  view.unmount();
  expect(() => editor.execute({ type: 'bold' })).not.toThrow();
});
