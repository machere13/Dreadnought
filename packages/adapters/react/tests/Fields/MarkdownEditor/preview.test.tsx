import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MarkdownEditorAdapter } from '../../../src/Fields/MarkdownEditor/index.ts';
import type { MarkdownEditorControls } from '../../../src/Fields/MarkdownEditor/index.ts';

afterEach(cleanup);
let controls: MarkdownEditorControls;
const toolbar = (value: MarkdownEditorControls) => { controls = value; return <button type="button" onClick={() => value.setPreview('preview')}>Preview</button>; };

it('keeps the textarea mounted and history alive across all modes without focusing hidden input', () => {
  const notify = vi.fn();
  const view = render(<MarkdownEditorAdapter defaultValue="hello" aria-label="Editor" renderToolbar={toolbar} renderPreview={value => <article>{value}</article>} onValueChange={notify} />);
  const field = screen.getByRole('textbox') as HTMLTextAreaElement;
  field.setSelectionRange(0, 5);
  act(() => controls.execute({ type: 'bold' }));
  fireEvent.click(screen.getByText('Preview'));
  expect(view.container.querySelector('textarea')).toBe(field);
  expect(field.closest('[hidden]')).not.toBeNull();
  expect(document.activeElement).not.toBe(field);
  act(() => controls.execute({ type: 'italic' }));
  expect(field.value).toBe('**hello**');
  act(() => controls.undo());
  expect(view.container.querySelector('article')?.textContent).toBe('hello');
  expect(document.activeElement).not.toBe(field);
  act(() => controls.setPreview('live'));
  expect(field.closest('[hidden]')).toBeNull();
  act(() => controls.redo());
  expect(field.value).toBe('**hello**');
  expect(document.activeElement).toBe(field);
  expect(notify.mock.calls.map(call => call[0])).toEqual(['**hello**', 'hello', '**hello**']);
});

it('preserves a controlled mode when its owner refuses and renders only accepted text', () => {
  const onPreviewChange = vi.fn();
  const view = render(<MarkdownEditorAdapter value="hello" preview="edit" onPreviewChange={onPreviewChange} renderToolbar={toolbar} renderPreview={value => <article>{value}</article>} />);
  act(() => controls.setPreview('live'));
  expect(controls.preview).toBe('edit');
  expect(onPreviewChange).toHaveBeenCalledWith('live');
  act(() => controls.execute({ type: 'bold' }));
  view.rerender(<MarkdownEditorAdapter value="hello" preview="preview" renderToolbar={toolbar} renderPreview={value => <article>{value}</article>} />);
  expect(view.container.querySelector('article')?.textContent).toBe('hello');
});

it('blurs focused input when the owner externally switches to preview', () => {
  const view = render(<MarkdownEditorAdapter preview="edit" />);
  const field = screen.getByRole('textbox');
  field.focus();
  view.rerender(<MarkdownEditorAdapter preview="preview" />);
  expect(document.activeElement).not.toBe(field);
});

it('supports a controlled preview owner without text callbacks', () => {
  const notify = vi.fn();
  function Controlled() {
    const [preview, setPreview] = useState<'edit' | 'preview' | 'live'>('edit');
    return <MarkdownEditorAdapter preview={preview} onPreviewChange={setPreview} onValueChange={notify} renderToolbar={toolbar} />;
  }
  render(<Controlled />);
  fireEvent.click(screen.getByText('Preview'));
  expect(controls.preview).toBe('preview');
  expect(notify).not.toHaveBeenCalled();
});
