// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getDisclosureOpen } from '../../src/index.ts';

describe('getDisclosureOpen', () => {
  it.each(['select', '', null, undefined, 0, {}, ['toggle']])('rejects invalid JS action %j even when disabled', action => {
    const fromJavaScript = getDisclosureOpen as (open: boolean, action: unknown, options?: { disabled?: boolean }) => boolean;
    expect(() => fromJavaScript(true, action)).toThrow(/action/i);
    expect(() => fromJavaScript(true, action, { disabled: true })).toThrow(/action/i);
  });
  it.each([
    [false, 'open', true], [true, 'open', true],
    [false, 'close', false], [true, 'close', false],
    [false, 'toggle', true], [true, 'toggle', false],
  ] as const)('%s + %s -> %s', (current, action, next) => {
    expect(getDisclosureOpen(current, action)).toBe(next);
    expect(getDisclosureOpen(current, action, { disabled: false })).toBe(next);
    const options = Object.freeze({ disabled: true });
    expect(getDisclosureOpen(current, action, options)).toBe(current);
    expect(options).toEqual({ disabled: true });
  });
});
