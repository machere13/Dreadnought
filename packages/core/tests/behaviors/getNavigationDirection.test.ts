// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as core from '../../src/index.ts';

describe('getNavigationDirection', () => {
  it('maps vertical navigation by default', () => {
    expect(core.getNavigationDirection('ArrowDown')).toBe('next');
    expect(core.getNavigationDirection('ArrowUp')).toBe('previous');
    expect(core.getNavigationDirection('ArrowLeft')).toBeUndefined();
    expect(core.getNavigationDirection('ArrowRight')).toBeUndefined();
  });

  it('maps horizontal arrows without consuming vertical ones', () => {
    expect(core.getNavigationDirection('ArrowLeft', { orientation: 'horizontal' })).toBe(
      'previous',
    );
    expect(core.getNavigationDirection('ArrowRight', { orientation: 'horizontal' })).toBe('next');
    expect(core.getNavigationDirection('ArrowDown', { orientation: 'horizontal' })).toBeUndefined();
    expect(core.getNavigationDirection('ArrowUp', { orientation: 'horizontal' })).toBeUndefined();
  });

  it('maps Home and End independently of orientation', () => {
    expect(core.getNavigationDirection('Home')).toBe('first');
    expect(core.getNavigationDirection('End')).toBe('last');
    expect(core.getNavigationDirection('Home', { orientation: 'horizontal' })).toBe('first');
    expect(core.getNavigationDirection('End', { orientation: 'horizontal' })).toBe('last');
  });

  it('leaves Home and End to a text cursor when disabled', () => {
    expect(core.getNavigationDirection('Home', { homeEnd: false })).toBeUndefined();
    expect(core.getNavigationDirection('End', { homeEnd: false })).toBeUndefined();
    expect(core.getNavigationDirection('ArrowDown', { homeEnd: false })).toBe('next');
  });

  it('does not interpret unrelated keys as navigation', () => {
    for (const key of ['', 'Enter', ' ', 'Escape', 'Tab', 'a', 'toString']) {
      expect(core.getNavigationDirection(key)).toBeUndefined();
    }
  });
});
