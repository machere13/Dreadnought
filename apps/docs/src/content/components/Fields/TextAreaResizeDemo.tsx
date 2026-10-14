import { useId } from 'react';
import { TextArea } from '@dreadnought/ui/react';

export function TextAreaResizeDemo() {
  const id = useId();
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Комментарий</label>
      <TextArea
        id={id}
        rows={3}
        minRows={2}
        maxRows={6}
        placeholder="Высоту можно изменить вручную"
      />
    </div>
  );
}
