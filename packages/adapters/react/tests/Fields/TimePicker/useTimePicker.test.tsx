import { StrictMode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTimePicker } from '../../../src/logic.ts';

afterEach(cleanup);

it('cancels a draft before a same-turn confirm and clears empty input only once', () => {
  const onChange = vi.fn();
  const { result } = renderHook(() =>
    useTimePicker({
      defaultValue: '09:30:00',
      defaultOpen: true,
      onChange,
    }),
  );
  act(() => {
    result.current.setDraft('10:45');
    result.current.cancel();
    result.current.confirm();
  });
  expect(result.current.value).toBe('09:30:00');
  expect(result.current.draft).toBe('09:30');
  expect(result.current.selection).toEqual({ hour: 9, minute: 30, second: 0 });
  expect(result.current.open).toBe(false);
  expect(onChange).not.toHaveBeenCalled();
  act(() => {
    result.current.setOpen(true);
    result.current.setDraft('');
    result.current.confirm();
    result.current.confirm();
  });
  expect(result.current.value).toBeNull();
  expect(result.current.draft).toBe('');
  expect(result.current.selection).toEqual({ hour: null, minute: null, second: null });
  expect(result.current.open).toBe(true);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
});

describe('time picker state', () => {
  it('reconciles a valid controlled seconds-mode change before calculating columns', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value, showSeconds }) => useTimePicker({ value, showSeconds, onChange }),
      { initialProps: { value: '09:00:03', showSeconds: true } },
    );
    rerender({ value: '09:00:00', showSeconds: false });
    expect(result.current.draft).toBe('09:00');
    expect(result.current.selection.second).toBe(0);
    expect(result.current.error).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });
  it('discards unconfirmed seconds when switching to a valid minutes-only mode', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ showSeconds }) => useTimePicker({ defaultValue: '09:00:00', showSeconds, onChange }),
      { initialProps: { showSeconds: true } },
    );
    act(() => result.current.setDraft('10:07:03'));
    rerender({ showSeconds: false });
    expect(result.current.draft).toBe('09:00');
    expect(result.current.value).toBe('09:00:00');
    act(() => result.current.choose('minute', 15));
    expect(result.current.draft).toBe('09:15');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('revalidates a previously rejected draft when constraints change', () => {
    const { result, rerender } = renderHook(
      ({ minTime }) => useTimePicker({ defaultValue: '09:00:00', minTime }),
      {
        initialProps: { minTime: '12:00:00' },
      },
    );
    act(() => result.current.confirm());
    expect(result.current.error).toBe('disabled');
    rerender({ minTime: '08:00:00' });
    expect(result.current.error).toBeNull();
    expect(result.current.invalid).toBe(false);
  });
  it('keeps invalid input separate and confirms corrected off-grid input', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: '09:00:00', minuteStep: 15, onChange }),
    );
    act(() => result.current.setDraft('10:'));
    act(() => result.current.confirm());
    expect(result.current.value).toBe('09:00:00');
    expect(result.current.error).toBe('incomplete');
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current.setDraft('10:07'));
    act(() => result.current.confirm());
    expect(result.current.value).toBe('10:07:00');
    expect(result.current.draft).toBe('10:07');
    act(() => result.current.confirm());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('10:07:00');
  });
  it('does not publish column choices before confirmation', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTimePicker({ minTime: '09:30:00', onChange }));
    act(() => result.current.choose('hour', 9));
    expect(result.current.selection).toEqual({ hour: 9, minute: 30, second: 0 });
    expect(result.current.draft).toBe('09:30');
    expect(result.current.value).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current.confirm());
    expect(result.current.value).toBe('09:30:00');
  });
  it('restores the accepted value after controlled rejection', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTimePicker({ value: '09:30:00', onChange }));
    act(() => result.current.setDraft('10:45'));
    act(() => result.current.confirm());
    expect(result.current.value).toBe('09:30:00');
    expect(result.current.draft).toBe('09:30');
    act(() => result.current.choose('minute', 15));
    expect(result.current.draft).toBe('09:15');
    act(() => result.current.cancel());
    expect(result.current.draft).toBe('09:30');
  });
  it('reconciles external value updates and dynamic constraints without publishing', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value, minTime }) => useTimePicker({ value, minTime, onChange }),
      {
        initialProps: { value: '09:30:00', minTime: '08:00:00' },
      },
    );
    act(() => result.current.setDraft('10:'));
    rerender({ value: '11:00:00', minTime: '08:00:00' });
    expect(result.current.draft).toBe('11:00');
    rerender({ value: '11:00:00', minTime: '12:00:00' });
    expect(result.current.value).toBe('11:00:00');
    expect(result.current.invalid).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
  it('keeps seconds explicit and rejects hiding nonzero seconds', () => {
    const { result } = renderHook(() =>
      useTimePicker({ showSeconds: true, defaultValue: '09:07:03' }),
    );
    expect(result.current.draft).toBe('09:07:03');
    act(() => result.current.setDraft('10:08:04'));
    act(() => result.current.confirm());
    expect(result.current.value).toBe('10:08:04');
    expect(() => renderHook(() => useTimePicker({ defaultValue: '09:07:03' }))).toThrow(RangeError);
    expect(() => renderHook(() => useTimePicker({ value: '25:00:00' }))).toThrow(TypeError);
  });
  it.each(['readOnly', 'disabled'] as const)('blocks mutations when %s', (flag) => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: '09:00:00', [flag]: true, onChange }),
    );
    act(() => {
      result.current.setDraft('10:00');
      result.current.choose('hour', 10);
      result.current.confirm();
      result.current.clear();
    });
    expect(result.current.value).toBe('09:00:00');
    expect(result.current.draft).toBe('09:00');
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current.setOpen(true));
    expect(result.current.open).toBe(flag === 'readOnly');
  });
  it('resets drafts and errors and calls clear only once under StrictMode', () => {
    const onChange = vi.fn();
    const { result, unmount } = renderHook(
      () => useTimePicker({ defaultValue: '09:00:00', onChange }),
      { wrapper: StrictMode },
    );
    act(() => {
      result.current.setDraft('25:00');
      result.current.confirm();
    });
    expect(result.current.error).toBe('format');
    act(() => result.current.reset());
    expect(result.current.error).toBeNull();
    expect(result.current.draft).toBe('09:00');
    act(() => {
      result.current.clear();
      result.current.clear();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(result.current.value).toBeNull();
    const controls = result.current;
    unmount();
    act(() => {
      controls.setDraft('10:00');
      controls.confirm();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
  it('does not replace a saved value when all times become unavailable', () => {
    const hours = Array.from({ length: 24 }, (_, value) => value);
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: '09:00:00', disabledTime: { hours } }),
    );
    expect(result.current.value).toBe('09:00:00');
    expect(result.current.invalid).toBe(true);
    expect(result.current.columns.hour.every((option) => option.disabled)).toBe(true);
    act(() => result.current.confirm());
    expect(result.current.error).toBe('disabled');
  });
});
