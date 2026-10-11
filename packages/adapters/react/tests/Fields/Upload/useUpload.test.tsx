import { StrictMode, useEffect, useRef } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useUpload } from '../../../src/logic.ts';
import type { UploadHandler } from '../../../src/Fields/Upload/upload.types.ts';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const file = () => new File(['x'], 'x.txt', { type: 'text/plain' });
it('leaves mount-effect uploads recoverable after StrictMode replay', async () => {
  const pending = deferred();
  let signal!: AbortSignal;
  const { result } = renderHook(
    () => {
      const upload = useUpload({
        autoUpload: true,
        upload: (_file, context) => {
          signal = context.signal;
          return signal.aborted ? Promise.resolve() : pending.promise;
        },
      });
      const initialized = useRef(false);
      useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        upload.add([file()]);
      }, []);
      return upload;
    },
    { wrapper: StrictMode },
  );
  expect(signal.aborted).toBe(true);
  expect(result.current.items[0].status).toBe('canceled');
  let task!: Promise<void>;
  act(() => {
    task = result.current.retry(result.current.items[0].id);
  });
  expect(signal.aborted).toBe(false);
  await act(async () => {
    pending.resolve();
    await task;
  });
  expect(result.current.items[0].status).toBe('success');
});
function deferred() {
  let resolve!: () => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

it('limits two additions before a render and permits duplicate names with unique IDs', () => {
  const { result } = renderHook(() => useUpload({ multiple: true, maxCount: 2 }));
  act(() => {
    result.current.add([file(), file()]);
    result.current.add([file()]);
  });
  expect(result.current.items).toHaveLength(2);
  expect(new Set(result.current.items.map((item) => item.id)).size).toBe(2);
  expect(result.current.rejections.map((item) => item.reason)).toEqual(['count']);
});

it('ignores late progress and completion after cancellation', async () => {
  const pending = deferred();
  let context!: Parameters<UploadHandler>[1];
  const { result } = renderHook(() =>
    useUpload({
      upload: (_file, ctx) => {
        context = ctx;
        ctx.signal.addEventListener('abort', () => ctx.onProgress(90));
        return pending.promise;
      },
    }),
  );
  act(() => result.current.add([file()]));
  const id = result.current.items[0].id;
  let task!: Promise<void>;
  act(() => {
    task = result.current.start(id);
    context.onProgress(20);
  });
  act(() => result.current.cancel(id));
  expect(context.signal.aborted).toBe(true);
  expect(result.current.items[0]).toMatchObject({ status: 'canceled', progress: 20 });
  await act(async () => {
    context.onProgress(100);
    pending.resolve();
    await task;
  });
  expect(result.current.items[0]).toMatchObject({ status: 'canceled', progress: 20 });
});

it('does not start a second request before rerender', async () => {
  const pending = deferred();
  let calls = 0;
  const { result } = renderHook(() =>
    useUpload({
      upload: () => {
        calls++;
        return pending.promise;
      },
    }),
  );
  act(() => result.current.add([file()]));
  const id = result.current.items[0].id;
  let task!: Promise<void>;
  act(() => {
    task = result.current.start(id);
    void result.current.start(id);
  });
  expect(calls).toBe(1);
  await act(async () => {
    pending.resolve();
    await task;
  });
  expect(result.current.items[0].status).toBe('success');
});

it('a retry wins over a canceled attempt even if that attempt ignores abort', async () => {
  const old = deferred();
  const next = deferred();
  const contexts: Parameters<UploadHandler>[1][] = [];
  const { result } = renderHook(() =>
    useUpload({
      upload: (_file, context) => {
        contexts.push(context);
        return contexts.length === 1 ? old.promise : next.promise;
      },
    }),
  );
  act(() => result.current.add([file()]));
  const id = result.current.items[0].id;
  let first!: Promise<void>;
  let second!: Promise<void>;
  act(() => {
    first = result.current.start(id);
    result.current.cancel(id);
    second = result.current.retry(id);
  });
  await act(async () => {
    contexts[0].onProgress(95);
    old.reject('late');
    await first;
  });
  expect(result.current.items[0]).toMatchObject({ status: 'uploading', progress: undefined });
  expect(contexts[0].signal).not.toBe(contexts[1].signal);
  await act(async () => {
    contexts[1].onProgress(40);
    next.resolve();
    await second;
  });
  expect(result.current.items[0]).toMatchObject({ status: 'success', progress: 100 });
});

it('handles thrown undefined as an error and retry clears it', async () => {
  let fail = true;
  const { result } = renderHook(() =>
    useUpload({
      upload: async () => {
        if (fail) throw undefined;
      },
    }),
  );
  act(() => result.current.add([file()]));
  const id = result.current.items[0].id;
  await act(async () => {
    await result.current.start(id);
  });
  expect(result.current.items[0].status).toBe('error');
  fail = false;
  await act(async () => {
    await result.current.retry(id);
  });
  expect(result.current.items[0].status).toBe('success');
});

it('does not revive removed or cleared files from late responses', async () => {
  for (const operation of ['remove', 'clear'] as const) {
    const pending = deferred();
    let context!: Parameters<UploadHandler>[1];
    const { result } = renderHook(() =>
      useUpload({
        upload: (_file, ctx) => {
          context = ctx;
          return pending.promise;
        },
      }),
    );
    act(() => result.current.add([file()]));
    const id = result.current.items[0].id;
    let task!: Promise<void>;
    act(() => {
      task = result.current.start(id);
      result.current[operation](id);
    });
    expect(context.signal.aborted).toBe(true);
    await act(async () => {
      context.onProgress(70);
      pending.resolve();
      await task;
    });
    expect(result.current.items).toEqual([]);
  }
});

it('startAll uses a snapshot and skips files removed by a reentrant handler', async () => {
  const sent: string[] = [];
  const { result } = renderHook(() =>
    useUpload({
      multiple: true,
      upload: async (current) => {
        sent.push(current.name);
        result.current.remove(result.current.items[1].id);
        result.current.add([new File(['x'], 'new.txt')]);
      },
    }),
  );
  act(() => result.current.add([file(), new File(['x'], 'second.txt')]));
  await act(async () => {
    await result.current.startAll();
  });
  expect(sent).toEqual(['x.txt']);
  expect(result.current.items.map((item) => item.status)).toEqual(['success', 'ready']);
});

it('changing disabled and handler does not interrupt an existing request', async () => {
  const pending = deferred();
  const sent: string[] = [];
  const first: UploadHandler = () => pending.promise;
  const second: UploadHandler = async (current) => {
    sent.push(current.name);
  };
  const { result, rerender } = renderHook(
    ({ disabled, upload }) => useUpload({ multiple: true, disabled, upload }),
    { initialProps: { disabled: false, upload: first } },
  );
  act(() => result.current.add([file(), new File(['x'], 'second.txt')]));
  let task!: Promise<void>;
  act(() => {
    task = result.current.start(result.current.items[0].id);
  });
  rerender({ disabled: true, upload: second });
  await act(async () => {
    result.current.add([file()]);
    await result.current.start(result.current.items[1].id);
    pending.resolve();
    await task;
  });
  expect(result.current.items).toHaveLength(2);
  expect(result.current.items[0].status).toBe('success');
  expect(sent).toEqual([]);
  rerender({ disabled: false, upload: second });
  await act(async () => {
    await result.current.start(result.current.items[1].id);
  });
  expect(sent).toEqual(['second.txt']);
});

it('starts accepted files automatically, but not rejected files', async () => {
  const { result } = renderHook(() =>
    useUpload({ autoUpload: true, maxSize: 1, upload: async () => {} }),
  );
  await act(async () => {
    result.current.add([new File(['too large'], 'bad.txt'), file()]);
  });
  expect(result.current.items[0].status).toBe('success');
  expect(result.current.rejections[0].reason).toBe('size');
});

it('keeps a file uploading until its promise resolves, regardless of progress', async () => {
  const pending = deferred();
  let context!: Parameters<UploadHandler>[1];
  const { result } = renderHook(() =>
    useUpload({
      upload: (_file, ctx) => {
        context = ctx;
        return pending.promise;
      },
    }),
  );
  act(() => result.current.add([file()]));
  let task!: Promise<void>;
  act(() => {
    task = result.current.start(result.current.items[0].id);
    context.onProgress(100);
  });
  expect(result.current.items[0].status).toBe('uploading');
  act(() => {
    context.onProgress(20);
    context.onProgress(NaN);
  });
  expect(result.current.items[0].progress).toBe(100);
  await act(async () => {
    pending.resolve();
    await task;
  });
});

it('uses the real picker and clear cancels its late result', async () => {
  let input!: HTMLInputElement;
  vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function () {
    input = this;
  });
  const { result } = renderHook(() => useUpload({ accept: '.txt' }));
  let task!: Promise<void>;
  act(() => {
    task = result.current.pick();
  });
  expect(input.accept).toBe('.txt');
  expect(result.current.picking).toBe(true);
  act(() => result.current.clear());
  Object.defineProperty(input, 'files', { value: [file()] });
  await act(async () => {
    input.dispatchEvent(new Event('change'));
    await task;
  });
  expect(result.current.items).toEqual([]);
  expect(result.current.picking).toBe(false);
});

it('picker cancel preserves selection and a picker failure is explicit', async () => {
  let input!: HTMLInputElement;
  const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function () {
    input = this;
  });
  const { result } = renderHook(() => useUpload());
  act(() => result.current.add([file()]));
  let task!: Promise<void>;
  act(() => {
    task = result.current.pick();
  });
  await act(async () => {
    input.dispatchEvent(new Event('cancel'));
    await task;
  });
  expect(result.current.items).toHaveLength(1);
  click.mockImplementation(() => {
    throw undefined;
  });
  await act(async () => {
    await result.current.pick();
  });
  expect(result.current.pickFailed).toBe(true);
});

it('StrictMode can start after effect replay and unmount aborts outstanding work', async () => {
  const pending = deferred();
  let context!: Parameters<UploadHandler>[1];
  const { result, unmount } = renderHook(
    () =>
      useUpload({
        upload: (_file, ctx) => {
          context = ctx;
          return pending.promise;
        },
      }),
    { wrapper: StrictMode },
  );
  act(() => result.current.add([file()]));
  let task!: Promise<void>;
  act(() => {
    task = result.current.start(result.current.items[0].id);
  });
  expect(result.current.items[0].status).toBe('uploading');
  unmount();
  expect(context.signal.aborted).toBe(true);
  pending.reject('late');
  await task;
});
