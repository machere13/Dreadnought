// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as core from '../../src/index.ts';

const options = { format: (value: number | null) => (value === null ? '' : String(value)) };

describe('getDraftTransition', () => {
  it('edits a draft without changing the accepted value or reporting a change', () => {
    expect(core.getDraftTransition(9, { type: 'edit', draft: '10:' }, options)).toEqual({
      value: 9,
      draft: '10:',
      changed: false,
    });
  });

  it('confirms and formats an uncontrolled value', () => {
    expect(core.getDraftTransition(9, { type: 'confirm', value: 10 }, options)).toEqual({
      value: 10,
      draft: '10',
      changed: true,
    });
  });

  it('reports a controlled proposal but restores the accepted value and draft', () => {
    expect(
      core.getDraftTransition(
        9,
        { type: 'confirm', value: 10 },
        {
          ...options,
          controlled: true,
        },
      ),
    ).toEqual({ value: 9, draft: '9', changed: true });
  });

  it('cancels to the accepted value without reporting a change', () => {
    expect(core.getDraftTransition(9, { type: 'cancel' }, options)).toEqual({
      value: 9,
      draft: '9',
      changed: false,
    });
  });

  it('allows null as a confirmed value and deduplicates repeated confirmation', () => {
    const cleared = core.getDraftTransition(9, { type: 'confirm', value: null }, options);
    expect(cleared).toEqual({ value: null, draft: '', changed: true });
    expect(
      core.getDraftTransition(cleared.value, { type: 'confirm', value: null }, options),
    ).toEqual({ value: null, draft: '', changed: false });
  });

  it('uses caller equality for composite values without mutating them', () => {
    const value = Object.freeze([1, 2]);
    const next = Object.freeze([1, 2]);
    const result = core.getDraftTransition(
      value,
      { type: 'confirm', value: next },
      {
        format: (range) => range.join('–'),
        isEqual: (left, right) => left[0] === right[0] && left[1] === right[1],
      },
    );
    expect(result).toEqual({ value: [1, 2], draft: '1–2', changed: false });
    expect(
      core.getDraftTransition(
        value,
        { type: 'confirm', value: next },
        {
          format: (range) => range.join('–'),
        },
      ).changed,
    ).toBe(true);
  });
});
