import { createRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import * as ui from '../src/adapters/react/index.ts';

afterEach(cleanup);

it('formats through the ready toolbar and restores native selection', () => {
  expect(ui.MarkdownEditor).toBeTypeOf('function');
  const ref = createRef<HTMLTextAreaElement>();
  const change = vi.fn();
  const input = vi.fn();
  render(<ui.MarkdownEditor ref={ref} aria-label="Notes" defaultValue="hello" onValueChange={change} onChange={input} />);
  const field = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect(ref.current).toBe(field);
  field.setSelectionRange(0, 5);
  screen.getByRole('button', { name: 'Жирный' }).focus();
  fireEvent.click(screen.getByRole('button', { name: 'Жирный' }));
  expect(field.value).toBe('**hello**');
  expect([field.selectionStart, field.selectionEnd]).toEqual([2, 7]);
  expect(document.activeElement).toBe(field);
  expect(change).toHaveBeenCalledExactlyOnceWith('**hello**');
  expect(input).not.toHaveBeenCalled();
  expect(screen.getByRole('toolbar').querySelectorAll('button')).toHaveLength(12);
});

it.each(['disabled', 'readOnly'] as const)('blocks every toolbar action in %s mode', mode => {
  render(<ui.MarkdownEditor aria-label="Notes" defaultValue="hello" {...{ [mode]: true }} />);
  for (const button of screen.getAllByRole('button')) expect((button as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Жирный' }));
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('hello');
});

it('preserves controlled acceptance with an inline native ref', () => {
  function Controlled() {
    const [value, setValue] = useState('hello');
    return <ui.MarkdownEditor aria-label="Notes" value={value} onValueChange={setValue} ref={node => { if (node) node.dataset.attached = 'true'; }} />;
  }
  render(<Controlled />);
  const field = screen.getByRole('textbox') as HTMLTextAreaElement;
  field.setSelectionRange(0, 5);
  fireEvent.click(screen.getByRole('button', { name: 'Курсив' }));
  expect(field.value).toBe('*hello*');
  expect([field.selectionStart, field.selectionEnd]).toEqual([1, 6]);
});

it('hides the toolbar without disabling keyboard commands or native attributes', () => {
  render(<ui.MarkdownEditor aria-label="Notes" toolbar={false} name="notes" required rows={7}
    className="custom-field" style={{ width: 320 }} defaultValue="hello" />);
  expect(screen.queryByRole('toolbar')).toBeNull();
  const field = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect([field.name, field.required, field.rows]).toEqual(['notes', true, 7]);
  expect(field.classList.contains('custom-field')).toBe(true);
  expect(field.style.width).toBe('320px');
  field.setSelectionRange(0, 5);
  fireEvent.keyDown(field, { key: 'b', ctrlKey: true });
  expect(field.value).toBe('**hello**');
});

it('allows a custom toolbar to use the same core commands', () => {
  render(<ui.MarkdownEditor aria-label="Notes" defaultValue="hello"
    renderToolbar={({ execute }) => <button onClick={() => execute({ type: 'heading', level: 3 })}>H3</button>} />);
  fireEvent.click(screen.getByText('H3'));
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('### hello');
  expect(screen.queryByRole('button', { name: 'Жирный' })).toBeNull();
});

it('localizes accessible toolbar labels and supports arrow navigation', () => {
  render(<ui.MarkdownEditor aria-label="Notes" labels={{ toolbar: 'Formatting', bold: 'Bold', italic: 'Italic' }} />);
  const bold = screen.getByRole('button', { name: 'Bold' });
  expect(screen.getByRole('toolbar', { name: 'Formatting' })).not.toBeNull();
  bold.focus();
  fireEvent.keyDown(bold, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Italic' }));
});

it('does not submit the surrounding form from formatting buttons', () => {
  const submit = vi.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><ui.MarkdownEditor aria-label="Notes" /></form>);
  fireEvent.click(screen.getByRole('button', { name: 'Таблица' }));
  expect(submit).not.toHaveBeenCalled();
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain('|--------|--------|');
});
