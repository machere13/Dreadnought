import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAccordion } from '../../../src/Navigation/Accordion/useAccordion.ts';

afterEach(cleanup);

describe('useAccordion', () => {
  it('starts closed and reports only user-requested single changes', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useAccordion({ defaultValue: null, onValueChange }));
    expect(result.current.value).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => result.current.toggle('faq'));
    expect(result.current.value).toBe('faq');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('faq');
    act(() => result.current.toggle('faq'));
    expect(result.current.value).toBeNull();
  });

  it('does not change a controlled value until its owner updates it', () => {
    const onValueChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useAccordion({ value, onValueChange }), {
      initialProps: { value: 'first' as string | null },
    });
    act(() => result.current.toggle('second'));
    expect(result.current.value).toBe('first');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('second');
    rerender({ value: 'second' });
    expect(result.current.value).toBe('second');
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('appends and removes values in multiple mode', () => {
    const { result } = renderHook(() => useAccordion({ multiple: true }));
    expect(result.current.value).toEqual([]);
    act(() => result.current.toggle('a'));
    act(() => result.current.toggle('b'));
    expect(result.current.value).toEqual(['a', 'b']);
    act(() => result.current.toggle('a'));
    expect(result.current.value).toEqual(['b']);
  });
});
