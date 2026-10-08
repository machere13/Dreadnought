import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useMarkdownEditor } from '../../../src/Fields/MarkdownEditor/index.ts';
import type {
  UseMarkdownEditorOptions,
  UseMarkdownEditorResult,
} from '../../../src/Fields/MarkdownEditor/index.ts';

let editor: UseMarkdownEditorResult;
function Editor(options: UseMarkdownEditorOptions) {
  editor = useMarkdownEditor(options);
  return <textarea aria-label="Editor" {...editor.textAreaProps} ref={editor.textAreaRef} />;
}
const field = () => screen.getByLabelText('Editor') as HTMLTextAreaElement;
function deferred() {
  let resolve!: (value: string) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<string>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
async function choose() {
  const input = document.querySelector('input[type=file]') as HTMLInputElement;
  expect(input.accept).toBe('image/*');
  await act(async () => {
    fireEvent.change(input, {
      target: { files: [new File(['png'], 'image.png', { type: 'image/png' })] },
    });
  });
}
beforeEach(() => {
  vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('inserts at the captured selection and records one undo step', async () => {
  const upload = deferred();
  render(<Editor defaultValue="hello world" uploadImage={() => upload.promise} />);
  field().setSelectionRange(0, 5);
  let work!: Promise<void>;
  act(() => {
    work = editor.insertImage();
  });
  await choose();
  expect(editor.imageUploadState).toBe('uploading');
  field().setSelectionRange(11, 11);
  fireEvent.select(field());
  await act(async () => {
    upload.resolve('/image.png');
    await work;
  });
  expect(field().value).toBe('![hello](/image.png) world');
  expect(editor.imageUploadState).toBe('idle');
  act(() => editor.undo());
  expect(field().value).toBe('hello world');
  act(() => editor.redo());
  expect(field().value).toBe('![hello](/image.png) world');
});

it('aborts on text edits and ignores a callback that resolves after abort', async () => {
  const upload = deferred();
  let signal!: AbortSignal;
  render(
    <Editor
      defaultValue="hello"
      uploadImage={(_, context) => {
        signal = context.signal;
        return upload.promise;
      }}
    />,
  );
  let work!: Promise<void>;
  act(() => {
    work = editor.insertImage();
  });
  await choose();
  fireEvent.change(field(), { target: { value: 'changed' } });
  expect(signal.aborted).toBe(true);
  await act(async () => {
    upload.resolve('/late.png');
    await work;
  });
  expect(field().value).toBe('changed');
  expect(editor.imageUploadState).toBe('idle');
});

it('does not revive an old request after undo returns the original text', async () => {
  const upload = deferred();
  render(<Editor defaultValue="hello" uploadImage={() => upload.promise} />);
  let work!: Promise<void>;
  act(() => {
    work = editor.insertImage();
  });
  await choose();
  fireEvent.change(field(), { target: { value: 'changed' } });
  act(() => editor.undo());
  await act(async () => {
    upload.resolve('/late.png');
    await work;
  });
  expect(field().value).toBe('hello');
});

it('cancels during file selection and removes the temporary input', async () => {
  render(<Editor uploadImage={async () => '/image.png'} />);
  let work!: Promise<void>;
  act(() => {
    work = editor.insertImage();
  });
  expect(editor.imageUploadState).toBe('selecting');
  await act(async () => {
    editor.cancelImageUpload();
    await work;
  });
  expect(document.querySelector('input[type=file]')).toBeNull();
  expect(editor.imageUploadState).toBe('idle');
});

it('an old rejected request cannot overwrite the state of a newer request', async () => {
  const old = deferred();
  const fresh = deferred();
  let calls = 0;
  render(<Editor uploadImage={() => (++calls === 1 ? old.promise : fresh.promise)} />);
  let first!: Promise<void>;
  let second!: Promise<void>;
  act(() => {
    first = editor.insertImage();
  });
  await choose();
  act(() => {
    editor.cancelImageUpload();
    second = editor.insertImage();
  });
  await choose();
  await act(async () => {
    old.reject(new Error('old'));
    await first;
  });
  expect(editor.imageUploadState).toBe('uploading');
  await act(async () => {
    fresh.resolve('/fresh.png');
    await second;
  });
  expect(field().value).toBe('![image](/fresh.png)');
});

it.each(['', 'javascript:alert(1)', 'data:image/png;base64,AA', '/bad\nurl', '<bad>'])(
  'rejects an invalid uploaded destination %j without editing',
  async (destination) => {
    render(<Editor defaultValue="hello" uploadImage={async () => destination} />);
    let work!: Promise<void>;
    act(() => {
      work = editor.insertImage();
    });
    await act(async () => {
      const input = document.querySelector('input[type=file]')!;
      fireEvent.change(input, { target: { files: [new File(['png'], 'image.png')] } });
      await work;
    });
    expect(field().value).toBe('hello');
    expect(editor.imageUploadState).toBe('error');
    expect(editor.imageUploadError).toBeInstanceOf(Error);
  },
);

it('aborts and ignores completion after unmount', async () => {
  const upload = deferred();
  let signal!: AbortSignal;
  const change = vi.fn();
  const view = render(
    <Editor
      uploadImage={(_, context) => {
        signal = context.signal;
        return upload.promise;
      }}
      onValueChange={change}
    />,
  );
  let work!: Promise<void>;
  act(() => {
    work = editor.insertImage();
  });
  await choose();
  view.unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => {
    upload.resolve('/late.png');
    await work;
  });
  expect(change).not.toHaveBeenCalled();
});

it('respects controlled acceptance and undo', async () => {
  function Controlled() {
    const [value, setValue] = useState('hello');
    return <Editor value={value} onValueChange={setValue} uploadImage={async () => '/image.png'} />;
  }
  render(<Controlled />);
  field().setSelectionRange(0, 5);
  let work!: Promise<void>;
  act(() => {
    work = editor.insertImage();
  });
  await act(async () => {
    fireEvent.change(document.querySelector('input[type=file]')!, {
      target: { files: [new File(['png'], 'image.png')] },
    });
    await work;
  });
  expect(field().value).toBe('![hello](/image.png)');
  act(() => editor.undo());
  expect(field().value).toBe('hello');
});

it.each(['disabled', 'readOnly'] as const)('does not select files while %s', async (flag) => {
  render(<Editor uploadImage={async () => '/image.png'} {...{ [flag]: true }} />);
  await act(async () => {
    await editor.insertImage();
  });
  expect(document.querySelector('input[type=file]')).toBeNull();
});

it('keeps the template command when no upload handler is supplied', async () => {
  render(<Editor defaultValue="" />);
  await act(async () => {
    await editor.insertImage();
  });
  expect(field().value).toBe('![image](url)');
});

it.each(['disabled', 'readOnly', 'preview'] as const)(
  'aborts when the editor becomes %s',
  async (mode) => {
    const upload = deferred();
    let signal!: AbortSignal;
    const handler: NonNullable<UseMarkdownEditorOptions['uploadImage']> = (_, context) => {
      signal = context.signal;
      return upload.promise;
    };
    const view = render(<Editor defaultValue="hello" uploadImage={handler} />);
    let work!: Promise<void>;
    act(() => {
      work = editor.insertImage();
    });
    await choose();
    view.rerender(
      <Editor
        defaultValue="hello"
        uploadImage={handler}
        {...(mode === 'preview' ? { preview: 'preview' } : { [mode]: true })}
      />,
    );
    expect(signal.aborted).toBe(true);
    await act(async () => {
      upload.resolve('/late.png');
      await work;
    });
    expect(field().value).toBe('hello');
  },
);

it('aborts on an external controlled replacement', async () => {
  const upload = deferred();
  let signal!: AbortSignal;
  const handler: NonNullable<UseMarkdownEditorOptions['uploadImage']> = (_, context) => {
    signal = context.signal;
    return upload.promise;
  };
  const change = vi.fn();
  const view = render(<Editor value="hello" onValueChange={change} uploadImage={handler} />);
  let work!: Promise<void>;
  act(() => {
    work = editor.insertImage();
  });
  await choose();
  view.rerender(<Editor value="external" onValueChange={change} uploadImage={handler} />);
  expect(signal.aborted).toBe(true);
  await act(async () => {
    upload.resolve('/late.png');
    await work;
  });
  expect(field().value).toBe('external');
  expect(change).not.toHaveBeenCalled();
});

it('does not record refused controlled insertion in history', async () => {
  const change = vi.fn();
  render(<Editor value="hello" onValueChange={change} uploadImage={async () => '/image.png'} />);
  field().setSelectionRange(0, 5);
  let work!: Promise<void>;
  act(() => {
    work = editor.insertImage();
  });
  await act(async () => {
    fireEvent.change(document.querySelector('input[type=file]')!, {
      target: { files: [new File(['png'], 'image.png')] },
    });
    await work;
  });
  expect(change).toHaveBeenCalledExactlyOnceWith('![hello](/image.png)');
  expect(field().value).toBe('hello');
  expect(editor.canUndo).toBe(false);
  expect(editor.imageUploadState).toBe('idle');
});

it('aborts on form reset even when the text remains unchanged', async () => {
  const upload = deferred();
  let signal!: AbortSignal;
  render(
    <form>
      <Editor
        defaultValue="hello"
        uploadImage={(_, context) => {
          signal = context.signal;
          return upload.promise;
        }}
      />
    </form>,
  );
  let work!: Promise<void>;
  act(() => {
    work = editor.insertImage();
  });
  await choose();
  await act(async () => {
    field().form!.reset();
  });
  expect(signal.aborted).toBe(true);
  await act(async () => {
    upload.resolve('/late.png');
    await work;
  });
  expect(field().value).toBe('hello');
});

it('user cancellation and duplicate clicks do not upload or edit the document', async () => {
  const handler = vi.fn(async () => '/image.png');
  render(<Editor defaultValue="hello" uploadImage={handler} />);
  let first!: Promise<void>;
  let second!: Promise<void>;
  act(() => {
    first = editor.insertImage();
    second = editor.insertImage();
  });
  expect(document.querySelectorAll('input[type=file]')).toHaveLength(1);
  await act(async () => {
    fireEvent(document.querySelector('input[type=file]')!, new Event('cancel'));
    await first;
    await second;
  });
  expect(handler).not.toHaveBeenCalled();
  expect(field().value).toBe('hello');
  expect(editor.imageUploadState).toBe('idle');
});

it('settles a retry started by an abort listener against an outdated document', async () => {
  const upload = deferred();
  let retry!: Promise<void>;
  render(
    <Editor
      defaultValue="hello"
      uploadImage={(_, { signal }) => {
        signal.addEventListener(
          'abort',
          () => {
            retry = editor.insertImage();
          },
          { once: true },
        );
        return upload.promise;
      }}
    />,
  );
  field().setSelectionRange(0, 5);
  let first!: Promise<void>;
  act(() => {
    first = editor.insertImage();
  });
  await choose();
  act(() => editor.execute({ type: 'bold' }));
  await choose();
  await act(async () => {
    await retry;
    upload.resolve('/late.png');
    await first;
  });
  expect(field().value).toBe('**hello**');
  expect(editor.imageUploadState).toBe('idle');
  act(() => {
    void editor.insertImage();
  });
  expect(editor.imageUploadState).toBe('selecting');
  await act(async () => {
    editor.cancelImageUpload();
  });
});

it.each(['paste', 'drop'] as const)(
  'uploads an image from %s at the saved selection with one undo step',
  async (kind) => {
    const upload = deferred();
    const file = new File(['png'], 'image.png', { type: 'image/png' });
    render(
      <Editor
        defaultValue="hello world"
        uploadImage={async (received) => {
          expect(received).toBe(file);
          return upload.promise;
        }}
      />,
    );
    field().setSelectionRange(0, 5);
    let allowed = true;
    await act(async () => {
      allowed = fireEvent[kind](field(), {
        [kind === 'paste' ? 'clipboardData' : 'dataTransfer']: { files: [file] },
      });
    });
    expect(allowed).toBe(false);
    expect(document.querySelector('input[type=file]')).toBeNull();
    expect(editor.imageUploadState).toBe('uploading');
    field().setSelectionRange(11, 11);
    await act(async () => {
      upload.resolve('/image.png');
    });
    expect(field().value).toBe('![hello](/image.png) world');
    act(() => editor.undo());
    expect(field().value).toBe('hello world');
    act(() => editor.redo());
    expect(field().value).toBe('![hello](/image.png) world');
  },
);

it('accepts image dragover even when files are protected until drop', () => {
  render(<Editor uploadImage={async () => '/image.png'} />);
  const transfer = { files: [], items: [{ kind: 'file', type: 'image/png' }], dropEffect: 'none' };
  expect(fireEvent.dragOver(field(), { dataTransfer: transfer })).toBe(false);
  expect(transfer.dropEffect).toBe('copy');
  expect(editor.imageUploadState).toBe('idle');
});

it.each(['paste', 'drop'] as const)(
  'leaves text, non-images and multiple files native for %s',
  async (kind) => {
    const upload = vi.fn(async () => '/image.png');
    render(<Editor uploadImage={upload} />);
    for (const files of [
      [],
      [new File(['txt'], 'file.txt', { type: 'text/plain' })],
      [
        new File(['a'], 'a.png', { type: 'image/png' }),
        new File(['b'], 'b.png', { type: 'image/png' }),
      ],
    ]) {
      expect(
        fireEvent[kind](field(), {
          [kind === 'paste' ? 'clipboardData' : 'dataTransfer']: { files },
        }),
      ).toBe(true);
    }
    expect(upload).not.toHaveBeenCalled();
    expect(editor.imageUploadState).toBe('idle');
  },
);

it.each(['paste', 'drop', 'dragOver'] as const)(
  'respects consumer cancellation and editing guards for %s',
  async (kind) => {
    const file = new File(['png'], 'image.png', { type: 'image/png' });
    const transfer = { files: [file], items: [{ kind: 'file', type: 'image/png' }] };
    const upload = vi.fn(async () => '/image.png');
    const event = { [kind === 'paste' ? 'clipboardData' : 'dataTransfer']: transfer };
    const view = render(
      <Editor
        uploadImage={upload}
        {...{ [`on${kind[0].toUpperCase()}${kind.slice(1)}`]: (e: Event) => e.preventDefault() }}
      />,
    );
    fireEvent[kind](field(), event);
    expect(upload).not.toHaveBeenCalled();
    for (const guard of [
      { disabled: true },
      { readOnly: true },
      { preview: 'preview' as const },
      {},
    ]) {
      view.rerender(
        <Editor {...guard} uploadImage={Object.keys(guard).length ? upload : undefined} />,
      );
      expect(fireEvent[kind](field(), event)).toBe(true);
    }
    view.rerender(<Editor uploadImage={upload} />);
    fireEvent.compositionStart(field());
    expect(fireEvent[kind](field(), event)).toBe(true);
    expect(upload).not.toHaveBeenCalled();
  },
);

it('does not queue a second image while uploading and ignores a cancelled paste result', async () => {
  const upload = deferred();
  let signal!: AbortSignal;
  let calls = 0;
  render(
    <Editor
      defaultValue="hello"
      uploadImage={(_, context) => {
        calls++;
        signal = context.signal;
        return upload.promise;
      }}
    />,
  );
  const file = new File(['png'], 'image.png', { type: 'image/png' });
  await act(async () => {
    fireEvent.paste(field(), { clipboardData: { files: [file] } });
  });
  await act(async () => {
    expect(fireEvent.drop(field(), { dataTransfer: { files: [file] } })).toBe(false);
  });
  expect(calls).toBe(1);
  act(() => editor.cancelImageUpload());
  expect(signal.aborted).toBe(true);
  await act(async () => {
    upload.resolve('/late.png');
  });
  expect(field().value).toBe('hello');
  expect(editor.imageUploadState).toBe('idle');
});

it.each(['paste', 'drop', 'dragOver'] as const)('ignores %s without transfer data', (kind) => {
  render(<Editor defaultValue="hello" uploadImage={async () => '/image.png'} />);
  expect(
    fireEvent[kind](field(), { [kind === 'paste' ? 'clipboardData' : 'dataTransfer']: null }),
  ).toBe(true);
  expect(field().value).toBe('hello');
  expect(editor.imageUploadState).toBe('idle');
});
