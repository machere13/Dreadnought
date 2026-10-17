import { useId } from 'react';
import { Input } from '@dreadnought/ui/react';

export function InputAppearanceDemo() {
  const id = useId();
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={`${id}-outlined`}>Обычное поле с рамкой</label>
      <Input id={`${id}-outlined`} variant="outlined" placeholder="Введите текст" />
      <label htmlFor={`${id}-filled`}>Компактное заполненное поле</label>
      <Input
        id={`${id}-filled`}
        controlSize="compact"
        variant="filled"
        placeholder="Введите текст"
        allowClear
      />
      <label htmlFor={`${id}-borderless`}>Поле без рамки</label>
      <Input id={`${id}-borderless`} variant="borderless" placeholder="Введите текст" />
    </div>
  );
}
