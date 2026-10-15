// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as core from '../../src/index.ts';

const items = [{ value: 'a' }, { value: 'b', disabled: true }, { value: 'c' }];

describe('getCollectionNavigation', () => {
  it('maps keys to enabled values without changing the collection', () => {
    const frozen = Object.freeze(items.map((item) => Object.freeze({ ...item })));
    expect(core.getCollectionNavigation(frozen, 'a', 'ArrowDown')).toBe('c');
    expect(core.getCollectionNavigation(frozen, 'c', 'ArrowUp')).toBe('a');
    expect(core.getCollectionNavigation(frozen, 'c', 'ArrowDown')).toBe('a');
  });

  it('respects horizontal orientation and leaves other keys alone', () => {
    const options = { orientation: 'horizontal' } as const;
    expect(core.getCollectionNavigation(items, 'a', 'ArrowRight', options)).toBe('c');
    expect(core.getCollectionNavigation(items, 'c', 'ArrowLeft', options)).toBe('a');
    for (const key of ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab', ' ']) {
      expect(core.getCollectionNavigation(items, 'a', key, options)).toBeUndefined();
    }
  });

  it('keeps the current endpoint when looping is disabled', () => {
    const options = { loop: false };
    expect(core.getCollectionNavigation(items, 'a', 'ArrowUp', options)).toBe('a');
    expect(core.getCollectionNavigation(items, 'c', 'ArrowDown', options)).toBe('c');
    expect(core.getCollectionNavigation(items, 'a', 'ArrowDown', options)).toBe('c');
  });

  it('supports Home and End unless the caller reserves them', () => {
    expect(core.getCollectionNavigation(items, 'c', 'Home')).toBe('a');
    expect(core.getCollectionNavigation(items, 'a', 'End')).toBe('c');
    expect(core.getCollectionNavigation(items, 'c', 'Home', { homeEnd: false })).toBeUndefined();
    expect(core.getCollectionNavigation(items, 'a', 'End', { homeEnd: false })).toBeUndefined();
  });

  it('recovers a missing or disabled current item from the requested edge', () => {
    expect(core.getCollectionNavigation(items, 'missing', 'ArrowDown')).toBe('a');
    expect(core.getCollectionNavigation(items, 'b', 'ArrowUp')).toBe('c');
  });

  it('handles empty, fully disabled and single-item collections', () => {
    expect(core.getCollectionNavigation([], 'a', 'ArrowDown')).toBeUndefined();
    expect(
      core.getCollectionNavigation([{ value: 'a', disabled: true }], 'a', 'Home'),
    ).toBeUndefined();
    expect(core.getCollectionNavigation([{ value: 'a' }], 'a', 'ArrowDown')).toBe('a');
  });
});
