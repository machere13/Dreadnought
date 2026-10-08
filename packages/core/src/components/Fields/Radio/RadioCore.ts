import type { CheckableStateOptions } from '#behaviors/getCheckableState';
export type RadioCoreOptions = CheckableStateOptions;
export interface RadioCore {
  checked: boolean;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
}
