import { expect, it } from 'vitest';
import { getTextFieldState } from '../../src/behaviors/getTextFieldState.ts';

it('normalizes shared text-field states', () => {
  expect(getTextFieldState({})).toEqual({ disabled: false, readOnly: false, required: false, invalid: false });
  expect(getTextFieldState({ disabled: true, invalid: true })).toEqual({
    disabled: true, readOnly: false, required: false, invalid: true,
  });
});
