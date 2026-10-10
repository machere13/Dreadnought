import type { SelectCore, SelectCoreOptions, SelectOption } from './SelectCore.ts';
export function getSelectState({
  options: entries,
  value = null,
  multiple = false,
  maxCount,
  query = '',
  filterOption = true,
  disabled = false,
  required = false,
  invalid = false,
}: SelectCoreOptions): SelectCore {
  if (maxCount !== undefined && (!Number.isSafeInteger(maxCount) || maxCount < 0)) {
    throw new RangeError('maxCount must be a nonnegative safe integer.');
  }
  if (value !== null && (multiple ? !Array.isArray(value) : typeof value !== 'string')) {
    throw new Error('Select value must match its multiple mode.');
  }
  const groups: { label?: string; options: SelectOption[]; disabled?: boolean }[] = [];
  for (const entry of entries) {
    if ('options' in entry) {
      groups.push({
        ...entry,
        options: entry.options.map((option) =>
          entry.disabled ? { ...option, disabled: true } : option,
        ),
      });
    } else {
      const last = groups.at(-1);
      if (last && last.label === undefined) {
        last.options.push(entry);
      } else {
        groups.push({ options: [entry] });
      }
    }
  }
  const values: readonly string[] =
    value === null ? [] : typeof value === 'string' ? [value] : [...new Set(value)];
  if (multiple && maxCount !== undefined && values.length >= maxCount) {
    for (const group of groups) {
      group.options = group.options.map((option) =>
        values.includes(option.value) ? option : { ...option, disabled: true },
      );
    }
  }
  const options = groups.flatMap((group) => group.options);
  const unique = new Set(options.map((option) => option.value));
  if (unique.size !== options.length || unique.has('')) {
    throw new Error('Select option values must be nonempty and unique.');
  }
  const search = query.trim().toLocaleLowerCase();
  const filteredOptions =
    filterOption === false
      ? options
      : options.filter((option) =>
          typeof filterOption === 'function'
            ? filterOption(query, option)
            : option.label.toLocaleLowerCase().includes(search),
        );
  const visible = new Set(filteredOptions.map((option) => option.value));
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => visible.has(option.value)),
    }))
    .filter((group) => group.options.length);
  return {
    options,
    groups,
    filteredGroups,
    values,
    selectedOptions: values.map(
      (v) => options.find((option) => option.value === v) ?? { value: v, label: v },
    ),
    filteredOptions,
    disabled,
    required,
    invalid,
  };
}
