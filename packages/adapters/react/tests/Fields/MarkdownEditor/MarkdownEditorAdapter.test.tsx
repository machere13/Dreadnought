import { createRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MarkdownEditorAdapter } from '../../../src/Fields/MarkdownEditor/index.ts';

afterEach(cleanup);

function ControlledWithInlineRef() {
  const [value, setValue] = useState('hello');
  return <MarkdownEditorAdapter aria-label="Notes" value={value} onValueChange={setValue}
    ref={node => { if (node) node.dataset.refAttached = 'true'; }}
    renderToolbar={({ execute }) => <button onClick={() => execute({ type: 'bold' })}>Bold</button>} />;
}

it('restores selection when a controlled consumer changes callback-ref identity', () => {
  render(<ControlledWithInlineRef />);
  const field = screen.getByLabelText('Notes') as HTMLTextAreaElement;
  field.setSelectionRange(0, 5);
  screen.getByText('Bold').focus();
  fireEvent.click(screen.getByText('Bold'));
  expect(field.value).toBe('**hello**');
  expect([field.selectionStart, field.selectionEnd]).toEqual([2, 7]);
  expect(document.activeElement).toBe(field);
});

it('keeps IME active when a controlled consumer changes callback-ref identity', () => {
  render(<ControlledWithInlineRef />);
  const field = screen.getByLabelText('Notes') as HTMLTextAreaElement;
  fireEvent.compositionStart(field);
  fireEvent.change(field, { target: { value: 'intermediate' } });
  fireEvent.click(screen.getByText('Bold'));
  expect(field.value).toBe('intermediate');
});

it('supports a custom toolbar and forwards the native textarea ref', () => {
  const ref = createRef<HTMLTextAreaElement>();
  render(<MarkdownEditorAdapter ref={ref} aria-label="Notes" defaultValue="hello"
    renderToolbar={({ execute }) => <button onClick={() => execute({ type: 'bold' })}>Bold</button>} />);
  const field = screen.getByLabelText('Notes') as HTMLTextAreaElement;
  expect(ref.current).toBe(field);
  field.setSelectionRange(0, 5);
  fireEvent.click(screen.getByText('Bold'));
  expect(field.value).toBe('**hello**');
  expect(field.getAttribute('renderToolbar')).toBeNull();
  expect(field.getAttribute('onValueChange')).toBeNull();
});

it('keeps native attributes and accessibility on the textarea, not wrapper', () => {
  render(<><p id="hint">Hint</p><MarkdownEditorAdapter aria-label="Notes" aria-describedby="hint"
    id="notes" name="notes" form="edit-form" rows={4} required invalid className="field" style={{ width: 300 }} /></>);
  const field = screen.getByLabelText('Notes') as HTMLTextAreaElement;
  expect([field.id, field.name, field.getAttribute('form'), field.rows, field.required]).toEqual(['notes', 'notes', 'edit-form', 4, true]);
  expect(field.getAttribute('aria-invalid')).toBe('true');
  expect(field.getAttribute('aria-describedby')).toBe('hint');
  expect(field.className).toBe('field');
  expect(field.style.width).toBe('300px');
  expect(field.parentElement!.className).toBe('');
  expect(field.parentElement!.getAttribute('name')).toBeNull();
});

it('passes disabled and readOnly to custom controls', () => {
  render(<MarkdownEditorAdapter aria-label="Notes" disabled readOnly
    renderToolbar={({ disabled, readOnly }) => <button disabled={disabled || readOnly}>Bold</button>} />);
  expect((screen.getByText('Bold') as HTMLButtonElement).disabled).toBe(true);
  expect((screen.getByLabelText('Notes') as HTMLTextAreaElement).readOnly).toBe(true);
});

it('preserves textarea autosizing and consumer ref cleanup', () => {
  const release = vi.fn();
  const ref = (node: HTMLTextAreaElement | null) => {
    if (node) {
      Object.defineProperty(node, 'scrollHeight', { configurable: true, get: () => 100 });
      return release;
    }
  };
  const view = render(<MarkdownEditorAdapter aria-label="Notes" ref={ref} autoSize maxRows={3}
    style={{ lineHeight: '20px', boxSizing: 'content-box', padding: 0, border: 0 }} />);
  const field = screen.getByLabelText('Notes') as HTMLTextAreaElement;
  expect(field.style.height).toBe('60px');
  expect(field.style.resize).toBe('none');
  expect(field.rows).toBe(1);
  view.unmount();
  expect(release).toHaveBeenCalledTimes(1);
});
