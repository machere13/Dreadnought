import { StrictMode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useDatePicker } from '../../../src/logic.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('yields during a long keyboard search and eventually reaches the allowed date', async () => {
  vi.useFakeTimers();
  let calls = 0;
  const disabledDate = (date: string) => {
    calls++;
    return date > '2026-10-12' && date < '2029-10-12';
  };
  const { result } = renderHook(() =>
    useDatePicker({
      defaultValue: '2026-10-12',
      defaultOpen: true,
      disabledDate,
    }),
  );
  calls = 0;
  act(() => result.current.move('nextDay'));
  expect(result.current.activeDate).toBe('2026-10-12');
  expect(calls).toBeLessThan(1000);
  expect(vi.getTimerCount()).toBeGreaterThan(0);
  await act(async () => vi.runAllTimersAsync());
  expect(result.current.activeDate).toBe('2029-10-12');
  expect(result.current.value).toBe('2026-10-12');
});

it.each(['cancel', 'reset', 'setMonth', 'unmount', 'constraints'] as const)(
  'cancels a pending keyboard search on %s',
  async (action) => {
    vi.useFakeTimers();
    const disabledDate = (date: string) => date > '2026-10-12' && date < '2029-10-12';
    const { result, unmount, rerender } = renderHook(
      ({ maxDate }) =>
        useDatePicker({
          defaultValue: '2026-10-12',
          defaultOpen: true,
          disabledDate,
          maxDate,
        }),
      { initialProps: { maxDate: '2030-01-01' } },
    );
    act(() => result.current.move('nextDay'));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    act(() => {
      if (action === 'unmount') unmount();
      else if (action === 'constraints') rerender({ maxDate: '2027-01-01' });
      else if (action === 'setMonth') result.current.setMonth('2026-09-01');
      else result.current[action]();
    });
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => vi.runAllTimersAsync());
    expect(result.current.month).not.toBe('2029-10-01');
  },
);

it('clamps an open view to changed bounds without rewriting the published value', () => {
  const { result, rerender } = renderHook(
    ({ minDate }) =>
      useDatePicker({
        defaultValue: '2026-10-12',
        defaultOpen: true,
        minDate,
      }),
    { initialProps: { minDate: '2026-10-01' } },
  );
  rerender({ minDate: '2026-11-01' });
  expect(result.current.month).toBe('2026-11-01');
  expect(result.current.activeDate).toBe('2026-11-01');
  expect(result.current.value).toBe('2026-10-12');
  expect(result.current.invalid).toBe(true);
});

it('publishes a range only after the second choice and sorts reversed ends', () => {
  const change = vi.fn();
  const { result } = renderHook(() => useDatePicker({ mode: 'range', onChange: change }));
  act(() => result.current.choose('2026-10-20'));
  expect(result.current.value).toBeNull();
  expect(change).not.toHaveBeenCalled();
  act(() => result.current.choose('2026-10-10'));
  expect(result.current.value).toEqual(['2026-10-10', '2026-10-20']);
  expect(change).toHaveBeenCalledExactlyOnceWith(['2026-10-10', '2026-10-20']);
});

it('supports two choices in one turn without stale state', () => {
  const { result } = renderHook(() => useDatePicker({ mode: 'range' }));
  act(() => {
    result.current.choose('2026-10-10');
    result.current.choose('2026-10-20');
  });
  expect(result.current.value).toEqual(['2026-10-10', '2026-10-20']);
});

it('does not mutate controlled value when parent declines a change', () => {
  const change = vi.fn();
  const { result } = renderHook(() => useDatePicker({ value: '2026-10-12', onChange: change }));
  act(() => result.current.choose('2026-10-13'));
  expect(result.current.value).toBe('2026-10-12');
  expect(result.current.draft[0]).toBe('2026-10-12');
  expect(change).toHaveBeenCalledExactlyOnceWith('2026-10-13');
});

it('leaves invalid text visible without publishing an impossible date', () => {
  const change = vi.fn();
  const { result } = renderHook(() =>
    useDatePicker({ defaultValue: '2026-10-12', onChange: change }),
  );
  act(() => result.current.setDraft(0, '2026-02-30'));
  act(() => result.current.confirm());
  expect(result.current.value).toBe('2026-10-12');
  expect(result.current.draft[0]).toBe('2026-02-30');
  expect(result.current.errors[0]).toBe('format');
  expect(change).not.toHaveBeenCalled();
});

it('confirms valid text once and clears empty text', () => {
  const change = vi.fn();
  const { result } = renderHook(() => useDatePicker({ onChange: change }));
  act(() => {
    result.current.setDraft(0, '2026-10-12');
    result.current.confirm();
    result.current.confirm();
  });
  expect(result.current.value).toBe('2026-10-12');
  expect(change).toHaveBeenCalledTimes(1);
  act(() => {
    result.current.setDraft(0, '');
    result.current.confirm();
  });
  expect(result.current.value).toBeNull();
});

it('rejects partial manual range and confirms an ordered complete range', () => {
  const { result } = renderHook(() => useDatePicker({ mode: 'range' }));
  act(() => {
    result.current.setDraft(0, '2026-10-20');
    result.current.confirm();
  });
  expect(result.current.value).toBeNull();
  expect(result.current.errors[1]).toBe('incomplete');
  act(() => {
    result.current.setDraft(1, '2026-10-10');
    result.current.confirm();
  });
  expect(result.current.value).toEqual(['2026-10-10', '2026-10-20']);
  expect(result.current.draft).toEqual(['2026-10-10', '2026-10-20']);
});

it('cannot publish dates blocked through typing or calendar selection', () => {
  const { result } = renderHook(() =>
    useDatePicker({ minDate: '2026-10-10', maxDate: '2026-10-20' }),
  );
  act(() => result.current.choose('2026-10-01'));
  expect(result.current.value).toBeNull();
  act(() => {
    result.current.setDraft(0, '2026-10-21');
    result.current.confirm();
  });
  expect(result.current.errors[0]).toBe('disabled');
  expect(result.current.value).toBeNull();
});

it('uses start context for a reversed manual range', () => {
  const { result } = renderHook(() =>
    useDatePicker({
      mode: 'range',
      disabledDate: (date, { from }) => from !== undefined && date < from,
    }),
  );
  act(() => {
    result.current.setDraft(0, '2026-10-20');
    result.current.setDraft(1, '2026-10-10');
    result.current.confirm();
  });
  expect(result.current.value).toBeNull();
  expect(result.current.errors[1]).toBe('disabled');
});

it.each(['clear', 'cancel'] as const)('%s prevents stale draft publishing on blur', (action) => {
  const { result } = renderHook(() => useDatePicker({ defaultValue: '2026-10-12' }));
  act(() => {
    result.current.setDraft(0, '2026-10-20');
    result.current[action]();
    result.current.confirm();
  });
  expect(result.current.value).toBe(action === 'clear' ? null : '2026-10-12');
});

it('replaces stale drafts with external controlled updates', () => {
  const { result, rerender } = renderHook(({ value }) => useDatePicker({ value }), {
    initialProps: { value: '2026-10-12' },
  });
  act(() => result.current.setDraft(0, '2026-10-20'));
  rerender({ value: '2026-10-15' });
  act(() => result.current.confirm());
  expect(result.current.draft[0]).toBe('2026-10-15');
  expect(result.current.value).toBe('2026-10-15');
});

it('marks values made unavailable by changed bounds without rewriting them', () => {
  const { result, rerender } = renderHook(
    ({ minDate }) =>
      useDatePicker({
        defaultValue: '2026-10-12',
        minDate,
      }),
    { initialProps: { minDate: '2026-10-01' } },
  );
  rerender({ minDate: '2026-10-15' });
  expect(result.current.value).toBe('2026-10-12');
  expect(result.current.invalid).toBe(true);
});

it('resets uncontrolled values to defaults without notifying a user change', () => {
  const change = vi.fn();
  const { result } = renderHook(() =>
    useDatePicker({ defaultValue: '2026-10-12', onChange: change }),
  );
  act(() => result.current.choose('2026-10-20'));
  change.mockClear();
  act(() => result.current.reset());
  expect(result.current.value).toBe('2026-10-12');
  expect(change).not.toHaveBeenCalled();
});

it('discard incomplete selection when closed and reopened', () => {
  const { result } = renderHook(() => useDatePicker({ mode: 'range' }));
  act(() => {
    result.current.setOpen(true);
    result.current.choose('2026-10-20');
  });
  act(() => {
    result.current.setOpen(false);
    result.current.setOpen(true);
  });
  expect(result.current.range).toEqual({ start: null, end: null });
});

it('readOnly permits viewing but not choosing, typing or clearing', () => {
  const { result } = renderHook(() =>
    useDatePicker({ readOnly: true, defaultValue: '2026-10-12' }),
  );
  act(() => {
    result.current.setOpen(true);
    result.current.choose('2026-10-20');
    result.current.setDraft(0, '2026-10-21');
    result.current.clear();
  });
  expect(result.current.open).toBe(true);
  expect(result.current.value).toBe('2026-10-12');
  expect(result.current.draft[0]).toBe('2026-10-12');
});

it('closes when disabled and never duplicates callbacks under StrictMode', () => {
  const change = vi.fn();
  const { result, rerender } = renderHook(
    ({ disabled }) => useDatePicker({ disabled, onChange: change }),
    {
      initialProps: { disabled: false },
      wrapper: StrictMode,
    },
  );
  act(() => {
    result.current.setOpen(true);
    result.current.choose('2026-10-12');
  });
  expect(change).toHaveBeenCalledTimes(1);
  act(() => result.current.setOpen(true));
  rerender({ disabled: true });
  expect(result.current.open).toBe(false);
  act(() => result.current.choose('2026-10-20'));
  expect(change).toHaveBeenCalledTimes(1);
});

it('rejects malformed public values and contradictory limits', () => {
  expect(() => renderHook(() => useDatePicker({ value: '2026-02-30' }))).toThrow(TypeError);
  expect(() =>
    renderHook(() => useDatePicker({ minDate: '2026-11-01', maxDate: '2026-10-01' })),
  ).toThrow(RangeError);
});

it('initializes the active date when parent opens a controlled picker', () => {
  const { result, rerender } = renderHook(
    ({ open }) =>
      useDatePicker({
        value: '2026-10-12',
        open,
      }),
    { initialProps: { open: false } },
  );
  rerender({ open: true });
  expect(result.current.activeDate).toBe('2026-10-12');
});

it('notifies closing an uncontrolled picker when it becomes disabled', () => {
  const change = vi.fn();
  const { result, rerender } = renderHook(
    ({ disabled }) =>
      useDatePicker({
        disabled,
        onOpenChange: change,
      }),
    { initialProps: { disabled: false } },
  );
  act(() => result.current.setOpen(true));
  change.mockClear();
  rerender({ disabled: true });
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
});

it('resets a draft when the selection mode changes', () => {
  const { result, rerender } = renderHook(
    ({ range }) => useDatePicker(range ? { mode: 'range' } : { mode: 'single' }),
    { initialProps: { range: false } },
  );
  act(() => result.current.choose('2026-10-12'));
  rerender({ range: true });
  expect(result.current.value).toBeNull();
  expect(result.current.draft).toEqual(['', '']);
});

it('keeps a blocked month navigable without choosing a disabled day', () => {
  const { result } = renderHook(() =>
    useDatePicker({
      defaultValue: '2026-10-12',
      minDate: '2026-10-01',
      maxDate: '2026-10-31',
      disabledDate: () => true,
    }),
  );
  act(() => result.current.setOpen(true));
  expect(result.current.activeDate).toBeNull();
  expect(result.current.open).toBe(true);
});

it('does not publish through an old controller after unmount', () => {
  const change = vi.fn();
  const { result, unmount } = renderHook(() => useDatePicker({ onChange: change }));
  const old = result.current;
  unmount();
  old.choose('2026-10-12');
  expect(change).not.toHaveBeenCalled();
});
