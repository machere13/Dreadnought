// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getNextEnabledValue } from '../../src/index.ts';

const items = [{ value: 'a' }, { value: 'b', disabled: true }, { value: 'c' }];

describe('getNextEnabledValue', () => {
  it('stops at boundaries when looping is disabled', () => {
    expect(getNextEnabledValue(items, 'c', 'next', { loop: false })).toBe('c');
    expect(getNextEnabledValue(items, 'a', 'previous', { loop: false })).toBe('a');
    expect(getNextEnabledValue(items, 'a', 'next', { loop: false })).toBe('c');
    expect(getNextEnabledValue(items, 'c', 'previous', { loop: false })).toBe('a');
  });

  it('wraps by default and skips disabled items', () => {
    expect(getNextEnabledValue(items, 'c', 'next')).toBe('a');
    expect(getNextEnabledValue(items, 'a', 'previous')).toBe('c');
    expect(getNextEnabledValue(items, 'a', 'next')).toBe('c');
  });

  it('finds boundaries when the current item is missing or disabled', () => {
    expect(getNextEnabledValue(items, 'missing', 'next', { loop: false })).toBe('a');
    expect(getNextEnabledValue(items, 'b', 'previous', { loop: false })).toBe('c');
    expect(getNextEnabledValue(items, 'c', 'first', { loop: false })).toBe('a');
    expect(getNextEnabledValue(items, 'a', 'last', { loop: false })).toBe('c');
  });

  it('returns no item for an empty or fully disabled collection', () => {
    expect(getNextEnabledValue([], 'a', 'next', { loop: false })).toBeUndefined();
    expect(getNextEnabledValue([{ value: 'a', disabled: true }], 'a', 'first')).toBeUndefined();
    expect(getNextEnabledValue([{ value: 'a' }], 'a', 'next', { loop: false })).toBe('a');
  });
});
