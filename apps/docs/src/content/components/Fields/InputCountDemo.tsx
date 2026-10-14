import { useId } from 'react';
import { Input } from '@dreadnought/ui/react';

export function InputCountDemo() {
  const id = useId();
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Название</label>
      <Input
        id={id}
        defaultValue="Dreadnought"
        showCount
        maxLength={30}
        allowClear
        clearLabel="Очистить название"
      />
    </div>
  );
}
