export interface CheckableStateOptions {
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}

export function getCheckableState({ checked = false, disabled = false, required = false, invalid = false }: CheckableStateOptions) {
  return { checked, disabled, required, invalid };
}
