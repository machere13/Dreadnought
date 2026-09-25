import { getTextFieldState } from '../../behaviors/getTextFieldState.js';
import type { TextAreaCore, TextAreaCoreOptions } from './TextAreaCore.js';

export function getTextAreaState(options: TextAreaCoreOptions): TextAreaCore {
  return getTextFieldState(options);
}
