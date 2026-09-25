import { expect, it } from 'vitest';
import { getTextAreaState } from '../../../src/components/TextArea/getTextAreaState.js';

it('provides the shared native text-field state', () => {
  expect(getTextAreaState({ readOnly: true, required: true })).toEqual({
    disabled: false, readOnly: true, required: true, invalid: false,
    rows: 2, minRows: undefined, maxRows: undefined, autoSize: false,
  });
});

it('keeps initial rows and optional resize limits separate', () => {
  expect(getTextAreaState({ rows: 4, minRows: 2, maxRows: 8, autoSize: true })).toEqual({
    disabled: false, readOnly: false, required: false, invalid: false,
    rows: 4, minRows: 2, maxRows: 8, autoSize: true,
  });
});

it('rejects non-positive or reversed row limits', () => {
  expect(() => getTextAreaState({ rows: 0 })).toThrow(RangeError);
  expect(() => getTextAreaState({ minRows: -1 })).toThrow(RangeError);
  expect(() => getTextAreaState({ maxRows: 1.5 })).toThrow(RangeError);
  expect(() => getTextAreaState({ minRows: 5, maxRows: 3 })).toThrow(RangeError);
});
