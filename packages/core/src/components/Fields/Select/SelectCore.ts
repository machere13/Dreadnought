export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectOptionGroup {
  label: string;
  options: readonly SelectOption[];
  disabled?: boolean;
}
export interface SelectOptionSection {
  label?: string;
  options: readonly SelectOption[];
  disabled?: boolean;
}
export type SelectValue = string | readonly string[] | null;
export interface SelectCoreOptions {
  options: readonly (SelectOption | SelectOptionGroup)[];
  value?: SelectValue;
  multiple?: boolean;
  query?: string;
  filterOption?: boolean | ((query: string, option: SelectOption) => boolean);
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}
export interface SelectCore {
  options: readonly SelectOption[];
  groups: readonly SelectOptionSection[];
  filteredGroups: readonly SelectOptionSection[];
  values: readonly string[];
  selectedOptions: readonly SelectOption[];
  filteredOptions: readonly SelectOption[];
  disabled: boolean;
  required: boolean;
  invalid: boolean;
}
