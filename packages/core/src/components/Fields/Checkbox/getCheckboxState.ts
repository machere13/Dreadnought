import { getCheckableState } from '#behaviors/getCheckableState';
import type { CheckboxCoreOptions, CheckboxCore } from './CheckboxCore.ts';
export function getCheckboxState({
  indeterminate = false,
  ...options
}: CheckboxCoreOptions = {}): CheckboxCore {
  const state = getCheckableState(options);
  return { ...state, indeterminate, ariaChecked: indeterminate ? 'mixed' : state.checked };
}
