import { useId, useState } from 'react';
import { Input } from '@dreadnought/ui/react';

export function InputNumberDemo() {
  const id = useId();
  const [value, setValue] = useState('1');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Количество</label>
      <Input
        id={id}
        type="number"
        name="quantity"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        stepButtonLabels={{ decrease: 'Уменьшить значение', increase: 'Увеличить значение' }}
      />
      <p role="status">{value === '' ? 'Количество не задано' : `Количество: ${value}`}</p>
    </div>
  );
}
