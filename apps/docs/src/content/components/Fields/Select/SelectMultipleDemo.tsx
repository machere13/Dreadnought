import { useState } from 'react';
import { Select } from '@dreadnought/ui/react';

const options = [
  { value: 'anna', label: 'Анна' },
  { value: 'boris', label: 'Борис', disabled: true },
  { value: 'vera', label: 'Вера' },
];

export function SelectMultipleDemo() {
  const [value, setValue] = useState<string[]>(['anna', 'vera']);
  return (
    <div>
      <p id="select-members-label">Участники</p>
      <Select
        multiple
        aria-labelledby="select-members-label"
        options={options}
        showSearch
        allowClear
        value={value}
        onValueChange={setValue}
        placeholder="Выберите участников"
      />
      <p role="status">
        Выбрано:{' '}
        {options
          .filter((option) => value.includes(option.value))
          .map((option) => option.label)
          .join(', ') || 'никого'}
      </p>
    </div>
  );
}
