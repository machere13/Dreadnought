import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useForm } from '../../../src/logic.ts';

afterEach(cleanup);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

it('does not loop when validators are declared inline', () => {
  const { result } = renderHook(() =>
    useForm({
      initialValues: { name: '' },
      validators: { name: (value) => (value ? undefined : 'Required') },
    }),
  );
  act(() => result.current.setValue('name', 'Ada'));
  expect(result.current.values.name).toBe('Ada');
});

it('rejects edits and manual errors after validation but before sending', async () => {
  for (const operation of ['change', 'error'] as const) {
    const check = deferred<string | undefined>();
    const name = () => check.promise;
    const send = vi.fn();
    const { result, rerender, unmount } = renderHook(() =>
      useForm({ initialValues: { name: 'Ada' }, validators: { name } }),
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.submit(send);
    });
    await act(async () => {
      check.resolve(undefined);
      while (result.current.validating) {
        await Promise.resolve();
        flushSync(() => rerender());
      }
      if (operation === 'change') result.current.setValue('name', '');
      else result.current.setError('name', 'Server');
      expect(await pending).toBe('stale');
    });
    expect(send).not.toHaveBeenCalled();
    unmount();
  }
});

it('uses the latest values in the same tick and blocks duplicate submits', async () => {
  const check = deferred<string | undefined>();
  const name = vi.fn(() => check.promise);
  const sent: unknown[] = [];
  const { result } = renderHook(
    () =>
      useForm({
        initialValues: { name: '' },
        validators: { name },
      }),
    { wrapper: StrictMode },
  );
  let pending!: Promise<unknown>;
  act(() => {
    result.current.setValue('name', 'Ada');
    pending = result.current.submit((values) => {
      sent.push(values);
    });
  });
  await act(async () => {
    expect(
      await result.current.submit(() => {
        sent.push('duplicate');
      }),
    ).toBe('busy');
    check.resolve(undefined);
    expect(await pending).toBe('success');
  });
  expect(sent).toEqual([{ name: 'Ada' }]);
  expect(name).toHaveBeenCalledTimes(1);
  expect(result.current.submitting).toBe(false);
});

it('ignores older validations even when values have not changed', async () => {
  const first = deferred<string | undefined>();
  const second = deferred<string | undefined>();
  let calls = 0;
  const name = () => (++calls === 1 ? first.promise : second.promise);
  const { result } = renderHook(() =>
    useForm({ initialValues: { name: '' }, validators: { name } }),
  );
  let a!: Promise<unknown>;
  let b!: Promise<unknown>;
  act(() => {
    a = result.current.validate();
    b = result.current.validate();
  });
  await act(async () => {
    second.resolve('New');
    expect(await b).toBe('invalid');
  });
  await act(async () => {
    first.resolve('Old');
    expect(await a).toBe('stale');
  });
  expect(result.current.errors).toEqual({ name: 'New' });
  expect(result.current.validating).toBe(false);
});

it('invalidates validation on changes, reset and manual errors', async () => {
  for (const operation of ['change', 'reset', 'error'] as const) {
    const check = deferred<string | undefined>();
    const name = () => check.promise;
    const { result, unmount } = renderHook(() =>
      useForm({ initialValues: { name: '' }, validators: { name } }),
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.validate();
    });
    act(() => {
      if (operation === 'change') result.current.setValue('name', 'Ada');
      if (operation === 'reset') result.current.reset();
      if (operation === 'error') result.current.setError('name', 'Server');
    });
    await act(async () => {
      check.resolve('Old');
      expect(await pending).toBe('stale');
    });
    expect(result.current.errors).toEqual(operation === 'error' ? { name: 'Server' } : {});
    expect(result.current.validating).toBe(false);
    unmount();
  }
});

it('does not submit values changed during validation', async () => {
  const check = deferred<string | undefined>();
  const name = () => check.promise;
  let sent = false;
  const { result } = renderHook(() =>
    useForm({ initialValues: { name: '' }, validators: { name } }),
  );
  let pending!: Promise<unknown>;
  act(() => {
    pending = result.current.submit(() => {
      sent = true;
    });
  });
  act(() => {
    result.current.setValue('name', 'Ada');
  });
  await act(async () => {
    check.resolve(undefined);
    expect(await pending).toBe('stale');
  });
  expect(sent).toBe(false);
  expect(result.current.touched).toEqual({ name: true });
});

it('keeps sending locked after reset and ignores the old send error', async () => {
  const send = deferred<void>();
  const { result } = renderHook(() => useForm({ initialValues: { name: '' } }));
  let pending!: Promise<unknown>;
  await act(async () => {
    pending = result.current.submit(() => send.promise);
    await Promise.resolve();
  });
  act(() => {
    result.current.reset({ name: 'New' });
  });
  await act(async () => {
    expect(await result.current.submit(() => {})).toBe('busy');
    send.reject(new Error('Old'));
    expect(await pending).toBe('stale');
  });
  expect(result.current.submitError).toBeUndefined();
  expect(result.current.values.name).toBe('New');
  await act(async () => {
    expect(await result.current.submit(() => {})).toBe('success');
  });
});

it('records thrown validation failures, including undefined, and rejects invalid return types', async () => {
  for (const name of [
    () => {
      throw undefined;
    },
    () => 42 as unknown as string,
  ]) {
    const { result, unmount } = renderHook(() =>
      useForm({ initialValues: { name: '' }, validators: { name } }),
    );
    let sent = false;
    await act(async () => {
      expect(
        await result.current.submit(() => {
          sent = true;
        }),
      ).toBe('invalid');
    });
    expect(Object.hasOwn(result.current.validationFailures, 'name')).toBe(true);
    expect(sent).toBe(false);
    unmount();
  }
});

it('allows retry after submission failure and clears the previous error', async () => {
  const error = new Error('Offline');
  const { result } = renderHook(() => useForm({ initialValues: {} }));
  await act(async () => {
    expect(
      await result.current.submit(() => {
        throw error;
      }),
    ).toBe('error');
  });
  expect(result.current.submitError).toBe(error);
  await act(async () => {
    expect(await result.current.submit(() => {})).toBe('success');
  });
  expect(result.current.submitError).toBeUndefined();
});

it('rechecks dependent fields on blur, tracks dirty and replaces the reset baseline', async () => {
  const confirmation = (
    value: string,
    values: Readonly<{ password: string; confirmation: string }>,
  ) => (value === values.password ? undefined : 'Mismatch');
  const { result } = renderHook(() =>
    useForm({
      initialValues: { password: '', confirmation: '' },
      validators: { confirmation },
    }),
  );
  act(() => {
    result.current.field('password').setValue('secret');
  });
  await act(async () => {
    result.current.field('password').onBlur();
  });
  expect(result.current.errors.confirmation).toBe('Mismatch');
  expect(result.current.field('password').dirty).toBe(true);
  expect(result.current.field('password').touched).toBe(true);
  act(() => {
    result.current.reset({ password: 'new', confirmation: 'new' });
  });
  act(() => {
    result.current.setValue('password', 'changed');
    result.current.reset();
  });
  expect(result.current.values).toEqual({ password: 'new', confirmation: 'new' });
  expect(result.current.dirty).toBe(false);
});

it('validates change mode and clears manual errors for fields without rules', async () => {
  const name = (value: string) => (value ? undefined : 'Required');
  const { result } = renderHook(() =>
    useForm({
      initialValues: { name: '', other: '' },
      validators: { name },
      validateOn: 'change',
    }),
  );
  await act(async () => {
    result.current.setValue('name', 'Ada');
  });
  expect(result.current.errors).toEqual({});
  act(() => {
    result.current.setError('other', 'Manual');
  });
  await act(async () => {
    expect(await result.current.validate()).toBe('valid');
  });
  expect(result.current.errors).toEqual({});
  await act(async () => {
    result.current.setValue('name', '');
  });
  expect(result.current.errors.name).toBe('Required');
});

it('invalidates pending checks when a rule function changes', async () => {
  const check = deferred<string | undefined>();
  const old = () => check.promise;
  const replacement = () => 'New';
  const { result, rerender } = renderHook(
    ({ name }) =>
      useForm({
        initialValues: { name: '' },
        validators: { name },
      }),
    { initialProps: { name: old as () => string | undefined | Promise<string | undefined> } },
  );
  let pending!: Promise<unknown>;
  act(() => {
    pending = result.current.validate();
  });
  rerender({ name: replacement });
  await act(async () => {
    check.resolve('Old');
    expect(await pending).toBe('stale');
  });
  await act(async () => {
    expect(await result.current.validate()).toBe('invalid');
  });
  expect(result.current.errors.name).toBe('New');
});

it('does not accept results after unmount or trigger checks in submit-only mode', async () => {
  const check = deferred<string | undefined>();
  const name = vi.fn(() => check.promise);
  const { result, unmount } = renderHook(() =>
    useForm({
      initialValues: { name: '' },
      validators: { name },
      validateOn: 'submit',
    }),
  );
  act(() => {
    result.current.setValue('name', 'Ada');
    result.current.field('name').onBlur();
  });
  expect(name).not.toHaveBeenCalled();
  let pending!: Promise<unknown>;
  act(() => {
    pending = result.current.validate();
  });
  unmount();
  check.resolve('Old');
  expect(await pending).toBe('stale');
});
