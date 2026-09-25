import type { InputCore, InputCoreOptions } from './InputCore.js';

export function getInputState({
  disabled = false,
  readOnly = false,
  required = false,
  invalid = false,
}: InputCoreOptions): InputCore {
  return { disabled, readOnly, required, invalid };
}
