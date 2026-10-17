import { useId } from 'react';
import { TextArea } from '@dreadnought/ui/react';

export function TextAreaAppearanceDemo() {
  const id = useId();
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={`${id}-filled`}>Компактные заметки</label>
      <TextArea
        id={`${id}-filled`}
        controlSize="compact"
        variant="filled"
        autoSize
        maxRows={4}
        allowClear
        showCount
        placeholder="Компактное заполненное поле"
      />
      <label htmlFor={`${id}-borderless`}>Заметки без рамки</label>
      <TextArea id={`${id}-borderless`} variant="borderless" rows={2} placeholder="Без рамки" />
    </div>
  );
}
