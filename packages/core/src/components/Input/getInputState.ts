import type { InputCore, InputCoreOptions } from './InputCore.ts';
import { getTextFieldState } from '../../behaviors/getTextFieldState.ts';

export function getInputState(options: InputCoreOptions): InputCore {
  return getTextFieldState(options);
}
