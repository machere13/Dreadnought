import type { InputCore, InputCoreOptions } from './InputCore.js';
import { getTextFieldState } from '../../behaviors/getTextFieldState.js';

export function getInputState(options: InputCoreOptions): InputCore {
  return getTextFieldState(options);
}
