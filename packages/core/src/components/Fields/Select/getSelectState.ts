import type { SelectCore, SelectCoreOptions } from './SelectCore.ts';
export function getSelectState({ options, value = null, multiple = false, query = '', filterOption = true, disabled = false, required = false, invalid = false }: SelectCoreOptions): SelectCore {
  const unique = new Set(options.map(option => option.value));
  if (unique.size !== options.length || unique.has('')) throw new Error('Select option values must be nonempty and unique.');
  if (value !== null && (multiple ? !Array.isArray(value) : typeof value !== 'string')) throw new Error('Select value must match its multiple mode.');
  const values: readonly string[] = value === null ? [] : typeof value === 'string' ? [value] : [...new Set(value)];
  const search = query.trim().toLocaleLowerCase();
  return { values, selectedOptions: values.map(v => options.find(option => option.value === v) ?? { value: v, label: v }),
    filteredOptions: filterOption === false ? options : options.filter(option => typeof filterOption === 'function'
      ? filterOption(query, option) : option.label.toLocaleLowerCase().includes(search)), disabled, required, invalid };
}
