// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as core from '../../src/index.ts';

describe('getSelectionValue', () => {
  it('selects, deselects, toggles and clears a single value', () => {
    expect(core.getSelectionValue(null, { type: 'select', value: 'a' })).toBe('a');
    expect(core.getSelectionValue('a', { type: 'select', value: 'a' })).toBe('a');
    expect(core.getSelectionValue('a', { type: 'select', value: 'b' })).toBe('b');
    expect(core.getSelectionValue('a', { type: 'deselect', value: 'b' })).toBe('a');
    expect(core.getSelectionValue('a', { type: 'deselect', value: 'a' })).toBeNull();
    expect(core.getSelectionValue('a', { type: 'toggle', value: 'a' })).toBeNull();
    expect(core.getSelectionValue('a', { type: 'toggle', value: 'b' })).toBe('b');
    expect(core.getSelectionValue('a', { type: 'clear' })).toBeNull();
  });

  it('changes multiple values without duplicates or input mutation', () => {
    const current = Object.freeze(['a', 'b']);
    expect(core.getSelectionValue(current, { type: 'select', value: 'b' })).toEqual(['a', 'b']);
    expect(core.getSelectionValue(current, { type: 'select', value: 'c' })).toEqual(['a', 'b', 'c']);
    expect(core.getSelectionValue(current, { type: 'deselect', value: 'a' })).toEqual(['b']);
    expect(core.getSelectionValue(current, { type: 'toggle', value: 'a' })).toEqual(['b']);
    expect(core.getSelectionValue(current, { type: 'toggle', value: 'c' })).toEqual(['a', 'b', 'c']);
    expect(core.getSelectionValue(current, { type: 'clear' })).toEqual([]);
    expect(current).toEqual(['a', 'b']);
    expect(core.getSelectionValue(['a', 'a'], { type: 'select', value: 'b' })).toEqual(['a', 'b']);
  });

  it('supports numeric keys including zero', () => {
    expect(core.getSelectionValue<number>(null, { type: 'select', value: 0 })).toBe(0);
    expect(core.getSelectionValue([0, 1], { type: 'toggle', value: 0 })).toEqual([1]);
  });

  it('blocks interaction with disabled values and preserves them on clear', () => {
    const options = { disabledValues: ['b'] };
    expect(core.getSelectionValue('a', { type: 'select', value: 'b' }, options)).toBe('a');
    expect(core.getSelectionValue(['a', 'b'], { type: 'toggle', value: 'b' }, options)).toEqual(['a', 'b']);
    expect(core.getSelectionValue(['a', 'b'], { type: 'clear' }, options)).toEqual(['b']);
    expect(core.getSelectionValue('b', { type: 'clear' }, options)).toBe('b');
    expect(core.getSelectionValue(['a'], { type: 'clear' }, { disabled: true })).toEqual(['a']);
  });

  it('does not remove the final required value but allows replacement', () => {
    const options = { required: true };
    expect(core.getSelectionValue('a', { type: 'clear' }, options)).toBe('a');
    expect(core.getSelectionValue('a', { type: 'toggle', value: 'a' }, options)).toBe('a');
    expect(core.getSelectionValue('a', { type: 'select', value: 'b' }, options)).toBe('b');
    expect(core.getSelectionValue(['a'], { type: 'deselect', value: 'a' }, options)).toEqual(['a']);
    expect(core.getSelectionValue(['a', 'b'], { type: 'toggle', value: 'a' }, options)).toEqual(['b']);
    expect(core.getSelectionValue<string>(null, { type: 'clear' }, options)).toBeNull();
  });
});
