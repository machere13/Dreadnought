import { cleanup, renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTabs } from '../../../src/Navigation/Tabs/useTabs.ts';

afterEach(cleanup);

describe('useTabs', () => {
  it('updates internal selection and reports each change once', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useTabs({ defaultValue: 'a', onValueChange }));
    act(() => result.current.setValue('b'));
    act(() => result.current.setValue('b'));
    expect(result.current.value).toBe('b');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('b');
  });

  it('does not change a controlled value until its owner updates it', () => {
    const onValueChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useTabs({ value, onValueChange }), {
      initialProps: { value: 'a' },
    });
    act(() => result.current.setValue('b'));
    expect(result.current.value).toBe('a');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('b');
    rerender({ value: 'b' });
    expect(result.current.value).toBe('b');
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
});
