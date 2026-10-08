import { describe, expect, it } from 'vitest';
import { getToolbarState } from '../../../src/index.ts';

describe('getToolbarState', () => {
  const items = Object.freeze([
    Object.freeze({ value: 'save' }),
    Object.freeze({ value: 'blocked', disabled: true }),
    Object.freeze({ value: 'copy' }),
  ]);

  it('defaults to a horizontal toolbar with the first enabled tab stop', () => {
    expect(getToolbarState({ items })).toEqual({
      role: 'toolbar',
      ariaOrientation: 'horizontal',
      tabStopValue: 'save',
    });
  });
  it('retains the last enabled active key', () => {
    expect(getToolbarState({ items, activeValue: 'copy', orientation: 'vertical' })).toEqual({
      role: 'toolbar',
      ariaOrientation: 'vertical',
      tabStopValue: 'copy',
    });
  });
  it.each(['removed', 'blocked'])(
    'falls back from unavailable key %s without mutating input',
    (activeValue) => {
      expect(getToolbarState({ items, activeValue }).tabStopValue).toBe('save');
      expect(items.map((item) => item.value)).toEqual(['save', 'blocked', 'copy']);
    },
  );
  it('uses ordinary group semantics in native mode', () => {
    expect(getToolbarState({ items, navigation: 'native', orientation: 'vertical' })).toEqual({
      role: 'group',
      ariaOrientation: undefined,
      tabStopValue: undefined,
    });
  });
  it.each([{ items: [] }, { items: [{ value: 'blocked', disabled: true }] }])(
    'has no tab stop without enabled participants',
    ({ items }) => {
      expect(getToolbarState({ items }).tabStopValue).toBeUndefined();
    },
  );
  it.each(['', '  '])('rejects an empty participant key', (value) => {
    expect(() => getToolbarState({ items: [{ value }] })).toThrow(/value.*empty/i);
  });
  it('rejects duplicate keys even when disabled', () => {
    expect(() =>
      getToolbarState({ items: [{ value: 'save' }, { value: 'save', disabled: true }] }),
    ).toThrow(/duplicate.*save/i);
  });
});
