export interface SelectOption { value: string; label: string; disabled?: boolean }
export type SelectValue = string | readonly string[] | null;
export interface SelectCoreOptions {
  options: readonly SelectOption[];
  value?: SelectValue;
  multiple?: boolean;
  query?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}
export interface SelectCore {
  values: readonly string[];
  selectedOptions: readonly SelectOption[];
  filteredOptions: readonly SelectOption[];
  disabled: boolean;
  required: boolean;
  invalid: boolean;
}
