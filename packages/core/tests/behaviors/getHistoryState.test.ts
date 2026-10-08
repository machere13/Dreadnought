// @vitest-environment node
import { expect, it } from 'vitest';
import { getHistoryState } from '../../src/index.ts';

it('moves immutable generic snapshots through undo and redo', () => {
  const initial = Object.freeze({
    past: Object.freeze([]),
    present: 'a',
    future: Object.freeze([]),
  });
  const edited = getHistoryState(initial, { type: 'commit', value: 'b' });
  expect(edited).toEqual({ past: ['a'], present: 'b', future: [] });
  const undone = getHistoryState(edited, { type: 'undo' });
  expect(undone).toEqual({ past: [], present: 'a', future: ['b'] });
  expect(getHistoryState(undone, { type: 'redo' })).toEqual(edited);
  expect(getHistoryState(initial, { type: 'undo' })).toBe(initial);
  expect(getHistoryState(edited, { type: 'redo' })).toBe(edited);
  expect(initial).toEqual({ past: [], present: 'a', future: [] });
});

it('replaces a snapshot without adding a step and resets the baseline', () => {
  const state = { past: [1], present: 2, future: [3] };
  expect(getHistoryState(state, { type: 'replace', value: 4 })).toEqual({
    past: [1],
    present: 4,
    future: [3],
  });
  expect(getHistoryState(state, { type: 'reset', value: 4 })).toEqual({
    past: [],
    present: 4,
    future: [],
  });
  expect(getHistoryState(state, { type: 'commit', value: 4 })).toEqual({
    past: [1, 2],
    present: 4,
    future: [],
  });
});

it('bounds retained snapshots and preserves generic object identity', () => {
  const value = { arbitrary: true };
  const state = getHistoryState(
    { past: [value, value], present: value, future: [value] },
    { type: 'commit', value },
    { limit: 1 },
  );
  expect(state.past).toEqual([value]);
  expect(state.present).toBe(value);
  expect(state.future).toEqual([]);
});

it.each([0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])(
  'rejects invalid limit %s',
  (limit) => {
    expect(() =>
      getHistoryState({ past: [], present: 0, future: [] }, { type: 'undo' }, { limit }),
    ).toThrow(RangeError);
  },
);

it('validates malformed JS state and actions before even a no-op', () => {
  const fromJs = getHistoryState as (state: unknown, action: unknown, options?: unknown) => unknown;
  for (const state of [null, {}, { past: 1, present: 0, future: [] }, { past: [], future: [] }]) {
    expect(() => fromJs(state, { type: 'undo' })).toThrow(TypeError);
  }
  for (const action of [null, {}, { type: 'bad' }, { type: 'commit' }]) {
    expect(() => fromJs({ past: [], present: undefined, future: [] }, action)).toThrow(TypeError);
  }
  expect(() => fromJs({ past: [], present: 0, future: [] }, { type: 'undo' }, null)).toThrow(
    TypeError,
  );
  expect(() =>
    fromJs({ past: [], present: 0, future: [] }, { type: 'undo' }, { limit: null }),
  ).toThrow(RangeError);
});
