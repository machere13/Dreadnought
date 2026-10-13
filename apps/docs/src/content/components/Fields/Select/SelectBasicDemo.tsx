import { useState } from 'react';
import { Select } from '@dreadnought/ui/react';

const options = [
  { value: 'anna', label: 'Анна' },
  { value: 'boris', label: 'Борис', disabled: true },
  { value: 'vera', label: 'Вера' },
];

export function SelectBasicDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div>
      <p id="select-owner-label">Исполнитель</p>
      <Select
        aria-labelledby="select-owner-label"
        name="owner"
        options={options}
        placeholder="Выберите исполнителя"
        showSearch
        allowClear
        value={value}
        onValueChange={setValue}
      />
      <p role="status">
        Исполнитель: {options.find((option) => option.value === value)?.label ?? 'не выбран'}
      </p>
    </div>
  );
}
