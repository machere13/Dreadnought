import { expect, it } from 'vitest';
import { getInputState } from '../../../../src/components/Fields/Input/getInputState.ts';

it('derives input states without changing native input behavior', () => {
  expect(getInputState({})).toEqual({ disabled: false, readOnly: false, required: false, invalid: false });
  expect(getInputState({ disabled: true, readOnly: true, required: true, invalid: true })).toEqual({
    disabled: true, readOnly: true, required: true, invalid: true,
  });
});
