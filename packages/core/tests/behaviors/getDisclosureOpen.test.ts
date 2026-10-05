// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getDisclosureOpen } from '../../src/index.ts';

describe('getDisclosureOpen', () => {
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
