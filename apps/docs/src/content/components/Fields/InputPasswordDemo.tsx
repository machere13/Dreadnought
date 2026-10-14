import { useId } from 'react';
import { Input } from '@dreadnought/ui/react';

export function InputPasswordDemo() {
  const id = useId();
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Пароль</label>
      <Input
        id={id}
        type="password"
        name="demo-password"
        autoComplete="new-password"
        passwordVisibilityLabels={{ show: 'Показать пароль', hide: 'Скрыть пароль' }}
      />
    </div>
  );
}
