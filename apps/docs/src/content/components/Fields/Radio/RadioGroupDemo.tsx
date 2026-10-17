import { useState } from 'react';
import { Radio } from '@dreadnought/ui/react';

const options = [
  { value: 'basic', label: 'Базовый' },
  { value: 'pro', label: 'Про' },
  { value: 'enterprise', label: 'Корпоративный', disabled: true },
];

export function RadioGroupDemo() {
  const [value, setValue] = useState('basic');
  return (
    <div>
      <Radio.Group
        label="Тариф"
        name="plan"
        value={value}
        onValueChange={setValue}
        options={options}
      />
      <p role="status">Выбран тариф: {options.find((option) => option.value === value)?.label}</p>
    </div>
  );
}
