import { describe, expect, it } from 'vitest';
import { getNextTabValue } from '../../../../src/components/Navigation/Tabs/getNextTabValue.ts';

const tabs = [{ value: 'a' }, { value: 'b', disabled: true }, { value: 'c' }];

describe('getNextTabValue', () => {
  it('moves forward and backward across enabled tabs with wraparound', () => {
    expect(getNextTabValue(tabs, 'a', 'next')).toBe('c');
    expect(getNextTabValue(tabs, 'c', 'next')).toBe('a');
    expect(getNextTabValue(tabs, 'a', 'previous')).toBe('c');
  });

  it('jumps to the first and last enabled tabs', () => {
    expect(getNextTabValue(tabs, 'c', 'first')).toBe('a');
    expect(getNextTabValue(tabs, 'a', 'last')).toBe('c');
  });

  it('starts from a boundary when the current value is absent', () => {
    expect(getNextTabValue(tabs, 'missing', 'next')).toBe('a');
    expect(getNextTabValue(tabs, 'missing', 'previous')).toBe('c');
  });

  it('does not choose a tab when none is enabled', () => {
    expect(getNextTabValue([{ value: 'a', disabled: true }], 'a', 'next')).toBeUndefined();
    expect(getNextTabValue([], 'a', 'next')).toBeUndefined();
  });
});
