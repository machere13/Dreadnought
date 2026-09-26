import { getTextFieldState } from '../../behaviors/getTextFieldState.ts';
import type { TextAreaCore, TextAreaCoreOptions } from './TextAreaCore.ts';

export function getTextAreaState({
  rows = 2,
  minRows,
  maxRows,
  autoSize = false,
  ...fieldOptions
}: TextAreaCoreOptions): TextAreaCore {
  for (const [name, value] of Object.entries({ rows, minRows, maxRows })) {
    if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
      throw new RangeError(`${name} must be a positive integer`);
    }
  }
  if (minRows !== undefined && maxRows !== undefined && minRows > maxRows) {
    throw new RangeError('minRows must not exceed maxRows');
  }
  return { ...getTextFieldState(fieldOptions), rows, minRows, maxRows, autoSize };
}
