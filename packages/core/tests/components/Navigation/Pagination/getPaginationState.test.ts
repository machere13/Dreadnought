import { describe, expect, it } from 'vitest';
import { getPaginationState } from '@dreadnought/core';

describe('getPaginationState', () => {
  it.each([
    { current: 1, items: [1, 2, 3, 4, 5, 'ellipsis-end', 20] },
    { current: 10, items: [1, 'ellipsis-start', 8, 9, 10, 11, 12, 'ellipsis-end', 20] },
    { current: 20, items: [1, 'ellipsis-start', 16, 17, 18, 19, 20] },
  ])('windows page $current', ({ current, items }) => {
    expect(getPaginationState({ total: 200, current }).items).toEqual(items);
  });

  it('expands a single missing page', () => {
    expect(getPaginationState({ total: 80, current: 5 }).items).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('handles empty, one page and clamping', () => {
    expect(getPaginationState({ total: 0, current: 8 })).toMatchObject({
      current: 1,
      pageCount: 1,
      offset: 0,
      end: 0,
      previous: undefined,
      next: undefined,
      items: [1],
    });
    expect(getPaginationState({ total: 3 })).toMatchObject({ offset: 0, end: 3, items: [1] });
    expect(getPaginationState({ total: 21, current: 99 })).toMatchObject({
      current: 3,
      offset: 20,
      end: 21,
      previous: 2,
      next: undefined,
    });
  });

  it.each([NaN, Infinity, -Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid total %s',
    (total) => {
      expect(() => getPaginationState({ total })).toThrow(RangeError);
    },
  );

  it.each([NaN, Infinity, -Infinity, -1, 0, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid current/pageSize %s',
    (value) => {
      expect(() => getPaginationState({ total: 10, current: value })).toThrow(RangeError);
      expect(() => getPaginationState({ total: 10, pageSize: value })).toThrow(RangeError);
    },
  );

  it('bounds work and arithmetic at the numeric boundary', () => {
    const total = Number.MAX_SAFE_INTEGER;
    expect(getPaginationState({ total, current: total, pageSize: total })).toMatchObject({
      current: 1,
      offset: 0,
      end: total,
    });
    const last = getPaginationState({ total, current: total, pageSize: 1 });
    expect(last.offset).toBe(total - 1);
    expect(last.end).toBe(total);
    expect(last.items.length).toBeLessThanOrEqual(9);
    expect(getPaginationState({ total, current: total, pageSize: 2 })).toMatchObject({
      offset: total - 1,
      end: total,
    });
  });

  it('preserves input and arithmetic while disabled', () => {
    const input = Object.freeze({ total: 35, current: 2, pageSize: 10, disabled: true });
    expect(getPaginationState(input)).toMatchObject({
      current: 2,
      offset: 10,
      end: 20,
      previous: undefined,
      next: undefined,
      items: [1, 2, 3, 4],
      disabled: true,
    });
    expect(input.current).toBe(2);
  });

  it('keeps windows ordered, unique and bounded', () => {
    for (let pageCount = 1; pageCount <= 30; pageCount++) {
      for (let current = 1; current <= pageCount; current++) {
        const { items } = getPaginationState({ total: pageCount, pageSize: 1, current });
        const numbers = items.filter((item): item is number => typeof item === 'number');
        expect(numbers).toEqual([...new Set(numbers)].sort((a, b) => a - b));
        expect(numbers[0]).toBe(1);
        expect(numbers.at(-1)).toBe(pageCount);
        expect(numbers).toContain(current);
        expect(items.length).toBeLessThanOrEqual(9);
      }
    }
  });
});
