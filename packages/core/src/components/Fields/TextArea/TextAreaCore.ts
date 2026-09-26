import type { TextFieldState, TextFieldStateOptions } from '../../../behaviors/getTextFieldState.ts';

export interface TextAreaCoreOptions extends TextFieldStateOptions {
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoSize?: boolean;
}

export interface TextAreaCore extends TextFieldState {
  rows: number;
  minRows?: number;
  maxRows?: number;
  autoSize: boolean;
}
