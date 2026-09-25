import { getTextFieldState } from '../../behaviors/getTextFieldState.js';
import type { TextareaCore, TextareaCoreOptions } from './TextareaCore.js';

export function getTextareaState(options: TextareaCoreOptions): TextareaCore {
  return getTextFieldState(options);
}
