import { StrictMode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { usePagination } from '@dreadnought/react/logic';

afterEach(cleanup);

it('keeps a normalized uncontrolled page without resurrecting it or emitting rerender events', () => {
  const changed = vi.fn();
  const view = renderHook(
    ({ total, pageSize }) =>
      usePagination({ total, pageSize, defaultCurrent: 9, onChange: changed }),
    { initialProps: { total: 100, pageSize: 10 }, wrapper: StrictMode },
  );
  view.rerender({ total: 20, pageSize: 10 });
  expect(view.result.current.current).toBe(2);
  view.rerender({ total: 100, pageSize: 10 });
  expect(view.result.current.current).toBe(2);
  view.rerender({ total: 100, pageSize: 20 });
  expect(view.result.current.current).toBe(2);
  expect(changed).not.toHaveBeenCalled();
  act(() => view.result.current.changePage(999));
  expect(view.result.current.current).toBe(5);
  expect(changed).toHaveBeenLastCalledWith(5, 20);
  act(() => view.result.current.changePage(5));
  expect(changed).toHaveBeenCalledTimes(1);
  expect(() => view.result.current.changePage(0)).toThrow(RangeError);
});

it('waits for controlled acceptance and preserves the owner value through shrinking data', () => {
  const changed = vi.fn();
  const view = renderHook(
    ({ current, total }) => usePagination({ total, current, onChange: changed }),
    { initialProps: { current: 9, total: 100 } },
  );
  act(() => view.result.current.changePage(3));
  expect(changed).toHaveBeenCalledExactlyOnceWith(3, 10);
  expect(view.result.current.current).toBe(9);
  view.rerender({ current: 3, total: 100 });
  expect(view.result.current.current).toBe(3);
  view.rerender({ current: 3, total: 20 });
  expect(view.result.current.current).toBe(2);
  view.rerender({ current: 3, total: 100 });
  expect(view.result.current.current).toBe(3);
  expect(changed).toHaveBeenCalledTimes(1);
});

it('clamps pageSize changes silently and initializes defaultCurrent only once', () => {
  const changed = vi.fn();
  const view = renderHook(
    ({ pageSize, defaultCurrent }) =>
      usePagination({ total: 100, pageSize, defaultCurrent, onChange: changed }),
    { initialProps: { pageSize: 10, defaultCurrent: 9 } },
  );
  view.rerender({ pageSize: 20, defaultCurrent: 1 });
  expect(view.result.current.current).toBe(5);
  view.rerender({ pageSize: 10, defaultCurrent: 1 });
  expect(view.result.current.current).toBe(5);
  expect(changed).not.toHaveBeenCalled();
});

it('blocks disabled requests and validates invalid requested numbers', () => {
  const changed = vi.fn();
  const view = renderHook(() => usePagination({ total: 100, disabled: true, onChange: changed }));
  act(() => view.result.current.changePage(2));
  expect(view.result.current.current).toBe(1);
  expect(changed).not.toHaveBeenCalled();
  expect(() => view.result.current.changePage(NaN)).toThrow(RangeError);
});
