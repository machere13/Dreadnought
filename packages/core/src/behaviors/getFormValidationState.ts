import type { FormState, FormValidationResult } from './form.types.ts';

export function getFormValidationState<V extends object>(
  state: FormState<V>,
  result: FormValidationResult<V>,
): { state: FormState<V>; accepted: boolean; valid: boolean } {
  if (result.revision !== state.revision) {
    return { state, accepted: false, valid: false };
  }
  return {
    state: { ...state, errors: { ...result.errors } },
    accepted: true,
    valid: Object.keys(result.errors).length === 0 && Object.keys(result.failures).length === 0,
  };
}
