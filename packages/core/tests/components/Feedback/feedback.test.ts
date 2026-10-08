import { expect, it } from 'vitest';
import * as core from '../../../src/index.ts';

it('derives toast semantics without announcing a closed notification', () => {
  expect(core).toHaveProperty('getToastState');
  expect(core.getToastState({ open: true, type: 'error' })).toEqual({
    open: true,
    rootProps: { role: 'alert', 'aria-atomic': true },
  });
  expect(core.getToastState({ open: false }).rootProps.role).toBeUndefined();
  expect(core.getToastState({ open: true }).rootProps.role).toBe('status');
});

it('subtracts elapsed time and rejects invalid countdown values', () => {
  expect(core).toHaveProperty('getCountdownRemaining');
  expect(core.getCountdownRemaining(3000, 1200)).toBe(1800);
  expect(core.getCountdownRemaining(3000, 4000)).toBe(0);
  for (const value of [-1, NaN, Infinity]) {
    expect(() => core.getCountdownRemaining(value, 0)).toThrow();
    expect(() => core.getCountdownRemaining(3000, value)).toThrow();
  }
});

it('exposes loading status only while loading', () => {
  expect(core).toHaveProperty('getLoaderState');
  expect(core.getLoaderState({ loading: true })).toEqual({
    loading: true,
    rootProps: { 'aria-busy': true },
    indicatorProps: { role: 'status', 'aria-live': 'polite' },
  });
  expect(core.getLoaderState({ loading: false }).indicatorProps.role).toBeUndefined();
});
