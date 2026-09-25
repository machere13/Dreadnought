import { expect, it } from 'vitest';
import { getTextareaState } from '../../../src/components/Textarea/getTextareaState.js';

it('provides the shared native text-field state', () => {
  expect(getTextareaState({ readOnly: true, required: true })).toEqual({
    disabled: false, readOnly: true, required: true, invalid: false,
  });
});
