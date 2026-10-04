import type { CheckableStateOptions } from '#behaviors/getCheckableState';
export interface CheckboxCoreOptions extends CheckableStateOptions { indeterminate?: boolean }
export interface CheckboxCore {
  checked: boolean;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  indeterminate: boolean;
  ariaChecked: boolean | 'mixed';
}
