import { expect, it } from 'vitest';
import { getTextAreaState } from '../../../src/components/TextArea/getTextAreaState.js';

it('provides the shared native text-field state', () => {
  expect(getTextAreaState({ readOnly: true, required: true })).toEqual({
    disabled: false, readOnly: true, required: true, invalid: false,
  });
});
