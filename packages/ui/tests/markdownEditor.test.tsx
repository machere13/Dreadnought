import { createRef, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import * as ui from '../src/adapters/react/index.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('uses themed tooltips instead of native titles and honors custom action labels', () => {
  vi.useFakeTimers();
  render(<ui.MarkdownEditor aria-label="Notes" labels={{ bold: 'Strong' }} />);
  const bold = screen.getByRole('button', { name: 'Strong' });
  fireEvent.pointerEnter(bold);
  expect(screen.queryByRole('tooltip')).toBeNull();
  act(() => vi.advanceTimersByTime(100));
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toBe('Strong');
  expect(tooltip.getAttribute('data-placement')).toBe('top');
  expect(tooltip.querySelector('[data-ui="tooltip-arrow"]')).not.toBeNull();
  expect(bold.getAttribute('aria-describedby')).toBe(tooltip.id);
  expect(screen.getByRole('toolbar').querySelector('button[title]')).toBeNull();
  fireEvent.keyDown(bold, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('keeps toolbar keyboard navigation and text selection when showing tooltips', () => {
  render(<ui.MarkdownEditor aria-label="Notes" defaultValue="hello" />);
  const field = screen.getByRole('textbox') as HTMLTextAreaElement;
  field.setSelectionRange(0, 5);
  const bold = screen.getByRole('button', { name: 'Жирный' });
  act(() => bold.focus());
  expect(screen.getByRole('tooltip').textContent).toBe('Жирный');
  fireEvent.keyDown(bold, { key: 'ArrowRight' });
  const italic = screen.getByRole('button', { name: 'Курсив' });
  expect(document.activeElement).toBe(italic);
  expect(document.getElementById(italic.getAttribute('aria-describedby')!)?.textContent).toBe(
    'Курсив',
  );
  fireEvent.click(italic);
  expect(field.value).toBe('*hello*');
  expect([field.selectionStart, field.selectionEnd]).toEqual([1, 6]);
  expect(document.activeElement).toBe(field);
});

it.each(['paste', 'drop'] as const)(
  'shows shared upload controls for an image %s and inserts into live preview',
  async (kind) => {
    let resolve!: (url: string) => void;
    function Controlled() {
      const [value, setValue] = useState('hello');
      return (
        <ui.MarkdownEditor
          aria-label="Notes"
          value={value}
          onValueChange={setValue}
          defaultPreview="live"
          uploadImage={() =>
            new Promise<string>((yes) => {
              resolve = yes;
            })
          }
        />
      );
    }
    render(<Controlled />);
    const field = screen.getByRole('textbox') as HTMLTextAreaElement;
    field.setSelectionRange(0, 5);
    const file = new File(['png'], 'image.png', { type: 'image/png' });
    await act(async () => {
      fireEvent[kind](field, {
        [kind === 'paste' ? 'clipboardData' : 'dataTransfer']: { files: [file] },
      });
    });
    expect(screen.getByRole('button', { name: 'Изображение' }).getAttribute('aria-busy')).toBe(
      'true',
    );
    expect(screen.getByRole('button', { name: 'Отменить загрузку изображения' })).toBeTruthy();
    await act(async () => {
      resolve('/image.png');
    });
    expect(screen.getByRole('img', { name: 'hello' }).getAttribute('src')).toBe('/image.png');
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    expect(field.value).toBe('hello');
    expect(screen.queryByRole('img')).toBeNull();
  },
);

it('shows upload progress and cancellation through the built-in image button', async () => {
  vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
  let resolve!: (url: string) => void;
  let signal!: AbortSignal;
  render(
    <ui.MarkdownEditor
      aria-label="Notes"
      defaultValue="hello"
      uploadImage={(_, context) => {
        signal = context.signal;
        return new Promise<string>((yes) => {
          resolve = yes;
        });
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Изображение' }));
  const picker = document.querySelector('input[type=file]');
  expect(picker).not.toBeNull();
  await act(async () => {
    fireEvent.change(picker!, {
      target: { files: [new File(['png'], 'image.png', { type: 'image/png' })] },
    });
  });
  expect(screen.getByRole('button', { name: 'Изображение' }).getAttribute('aria-busy')).toBe(
    'true',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Отменить загрузку изображения' }));
  expect(signal.aborted).toBe(true);
  await act(async () => {
    resolve('/late.png');
  });
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('hello');
  expect(screen.queryByRole('button', { name: 'Отменить загрузку изображения' })).toBeNull();
});

it('shows a reusable Alert on upload failure and clears it on retry', async () => {
  vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
  render(
    <ui.MarkdownEditor
      aria-label="Notes"
      uploadImage={async () => {
        throw new Error('private server details');
      }}
      labels={{ uploadError: 'Upload failed' }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Изображение' }));
  await act(async () => {
    fireEvent.change(document.querySelector('input[type=file]')!, {
      target: { files: [new File(['png'], 'image.png')] },
    });
  });
  expect(screen.getByRole('alert').textContent).toBe('Upload failed');
  expect(screen.getByRole('alert').getAttribute('data-ui')).toBe('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Изображение' }));
  expect(screen.queryByRole('alert')).toBeNull();
  await act(async () => {
    fireEvent(document.querySelector('input[type=file]')!, new Event('cancel'));
  });
});

it('formats through the ready toolbar and restores native selection', () => {
  expect(ui.MarkdownEditor).toBeTypeOf('function');
  const ref = createRef<HTMLTextAreaElement>();
  const change = vi.fn();
  const input = vi.fn();
  render(
    <ui.MarkdownEditor
      ref={ref}
      aria-label="Notes"
      defaultValue="hello"
      onValueChange={change}
      onChange={input}
    />,
  );
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
  expect(screen.getByRole('toolbar').querySelectorAll('button')).toHaveLength(17);
});

it.each(['disabled', 'readOnly'] as const)('blocks every toolbar action in %s mode', (mode) => {
  render(<ui.MarkdownEditor aria-label="Notes" defaultValue="hello" {...{ [mode]: true }} />);
  for (const button of screen
    .getAllByRole('button')
    .filter((button) => !button.hasAttribute('aria-pressed'))) {
    expect((button as HTMLButtonElement).disabled).toBe(true);
  }
  fireEvent.click(screen.getByRole('button', { name: 'Жирный' }));
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('hello');
});

it('shows a live preview and exposes history and selected mode controls', () => {
  render(<ui.MarkdownEditor defaultValue="# Hello" defaultPreview="live" aria-label="Notes" />);
  expect((screen.getByRole('button', { name: 'Отменить' }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  expect(screen.getByRole('heading', { name: 'Hello' })).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Текст и предпросмотр' }).getAttribute('aria-pressed'),
  ).toBe('true');
  const field = screen.getByRole('textbox') as HTMLTextAreaElement;
  field.setSelectionRange(2, 7);
  fireEvent.click(screen.getByRole('button', { name: 'Жирный' }));
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
  expect(field.value).toBe('# Hello');
  const redo = screen.getByRole('button', { name: 'Повторить' });
  redo.focus();
  fireEvent.click(redo);
  expect([field.selectionStart, field.selectionEnd]).toEqual([4, 9]);
  fireEvent.click(screen.getByRole('button', { name: 'Предпросмотр' }));
  expect(screen.queryByRole('textbox')).toBeNull();
  expect((screen.getByRole('button', { name: 'Жирный' }) as HTMLButtonElement).disabled).toBe(true);
  expect(field.isConnected).toBe(true);
});

it('supports standalone styled preview and toolbar-free preview', () => {
  const view = render(<ui.MarkdownPreview value="## Preview" aria-label="Rendered" />);
  expect(screen.getByRole('heading', { name: 'Preview' })).toBeTruthy();
  view.rerender(<ui.MarkdownEditor toolbar={false} preview="preview" value="## Preview" />);
  expect(screen.queryByRole('toolbar')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Preview' })).toBeTruthy();
});

it('preserves controlled acceptance with an inline native ref', () => {
  function Controlled() {
    const [value, setValue] = useState('hello');
    return (
      <ui.MarkdownEditor
        aria-label="Notes"
        value={value}
        onValueChange={setValue}
        ref={(node) => {
          if (node) {
            node.dataset.attached = 'true';
          }
        }}
      />
    );
  }
  render(<Controlled />);
  const field = screen.getByRole('textbox') as HTMLTextAreaElement;
  field.setSelectionRange(0, 5);
  fireEvent.click(screen.getByRole('button', { name: 'Курсив' }));
  expect(field.value).toBe('*hello*');
  expect([field.selectionStart, field.selectionEnd]).toEqual([1, 6]);
});

it('hides the toolbar without disabling keyboard commands or native attributes', () => {
  render(
    <ui.MarkdownEditor
      aria-label="Notes"
      toolbar={false}
      name="notes"
      required
      rows={7}
      className="custom-field"
      style={{ width: 320 }}
      defaultValue="hello"
    />,
  );
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
  render(
    <ui.MarkdownEditor
      aria-label="Notes"
      defaultValue="hello"
      renderToolbar={({ execute }) => (
        <button onClick={() => execute({ type: 'heading', level: 3 })}>H3</button>
      )}
    />,
  );
  fireEvent.click(screen.getByText('H3'));
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('### hello');
  expect(screen.queryByRole('button', { name: 'Жирный' })).toBeNull();
});

it('localizes accessible toolbar labels and supports arrow navigation', () => {
  render(
    <ui.MarkdownEditor
      aria-label="Notes"
      labels={{ toolbar: 'Formatting', bold: 'Bold', italic: 'Italic' }}
    />,
  );
  const bold = screen.getByRole('button', { name: 'Bold' });
  expect(screen.getByRole('toolbar', { name: 'Formatting' })).not.toBeNull();
  bold.focus();
  fireEvent.keyDown(bold, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Italic' }));
});

it('separates formatting from editor controls without breaking keyboard navigation', () => {
  render(<ui.MarkdownEditor aria-label="Notes" />);
  const groups = screen.getAllByRole('group');
  expect(groups).toHaveLength(2);
  expect(groups[0].contains(screen.getByRole('button', { name: 'Жирный' }))).toBe(true);
  expect(groups[0].contains(screen.getByRole('button', { name: 'Таблица' }))).toBe(true);
  expect(groups[1].contains(screen.getByRole('button', { name: 'Отменить' }))).toBe(true);
  expect(groups[1].contains(screen.getByRole('button', { name: 'Предпросмотр' }))).toBe(true);
  const table = screen.getByRole('button', { name: 'Таблица' });
  table.focus();
  fireEvent.keyDown(table, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Редактирование' }));
});

it('does not submit the surrounding form from formatting buttons', () => {
  const submit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <ui.MarkdownEditor aria-label="Notes" />
    </form>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Таблица' }));
  expect(submit).not.toHaveBeenCalled();
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain(
    '|--------|--------|',
  );
});
