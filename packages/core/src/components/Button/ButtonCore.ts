export interface ButtonCoreOptions {
  disabled?: boolean;
  loading?: boolean;
}

export interface ButtonCore {
  nativeDisabled: boolean;
  ariaDisabled: boolean;
  busy: boolean;
  actionBlocked: boolean;
}
