export interface ButtonStateInput {
  disabled?: boolean;
  loading?: boolean;
}

export interface ButtonState {
  nativeDisabled: boolean;
  ariaDisabled: boolean;
  busy: boolean;
  actionBlocked: boolean;
}
