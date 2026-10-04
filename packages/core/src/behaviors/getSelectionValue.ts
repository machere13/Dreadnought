export type SelectionKey = string | number;
export type SelectionValue<T extends SelectionKey = SelectionKey> = T | null | readonly T[];
export type SelectionAction<T extends SelectionKey = SelectionKey> =
  | { type: 'select' | 'deselect' | 'toggle'; value: T }
  | { type: 'clear' };
export interface SelectionOptions<T extends SelectionKey = SelectionKey> {
  disabled?: boolean;
  disabledValues?: readonly T[];
  required?: boolean;
}

export function getSelectionValue<T extends SelectionKey>(current: readonly T[], action: SelectionAction<T>, options?: SelectionOptions<T>): T[];
export function getSelectionValue<T extends SelectionKey>(current: T | null, action: SelectionAction<T>, options?: SelectionOptions<T>): T | null;
export function getSelectionValue<T extends SelectionKey>(current: SelectionValue<T>, action: SelectionAction<T>, options?: SelectionOptions<T>): T | null | T[];
/** Computes a requested selection; state ownership and events belong to the caller. */
export function getSelectionValue<T extends SelectionKey>(current: SelectionValue<T>, action: SelectionAction<T>,
  { disabled = false, disabledValues = [], required = false }: SelectionOptions<T> = {}): T | null | T[] {
  const multiple = Array.isArray(current);
  const values: T[] = multiple ? [...new Set(current as readonly T[])] : current === null ? [] : [current as T];
  let next = values;
  if (!disabled) {
    if (action.type === 'clear') next = values.filter(value => disabledValues.includes(value));
    else if (!disabledValues.includes(action.value)) {
      const selected = values.includes(action.value);
      if (action.type === 'select' || (action.type === 'toggle' && !selected)) {
        next = multiple ? selected ? values : [...values, action.value] : [action.value];
      } else if (action.type === 'deselect' || action.type === 'toggle') {
        next = values.filter(value => value !== action.value);
      }
    }
  }
  if (required && values.length > 0 && next.length === 0) next = values;
  return multiple ? next : next[0] ?? null;
}
