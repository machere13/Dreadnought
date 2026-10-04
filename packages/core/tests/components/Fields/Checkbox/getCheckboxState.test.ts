import { expect, it } from 'vitest';
import * as core from '../../../../src/index.ts';

it('reports mixed checkboxes independently of checked and normalizes field flags', () => {
  expect(core.getCheckboxState({ checked: true, indeterminate: true, invalid: true })).toEqual({
    checked: true, indeterminate: true, disabled: false, required: false, invalid: true, ariaChecked: 'mixed',
  });
  expect(core.getRadioState({ checked: true, disabled: true }).checked).toBe(true);
});
