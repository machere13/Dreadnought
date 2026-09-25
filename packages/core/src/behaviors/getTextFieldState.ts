export interface TextFieldStateOptions {
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
}

export interface TextFieldState {
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
}

export function getTextFieldState({
  disabled = false,
  readOnly = false,
  required = false,
  invalid = false,
}: TextFieldStateOptions): TextFieldState {
  return { disabled, readOnly, required, invalid };
}
