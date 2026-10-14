import { useId } from 'react';
import { TextArea } from '@dreadnought/ui/react';

export function TextAreaAutoSizeDemo() {
  const id = useId();
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Заметки</label>
      <TextArea
        id={id}
        name="notes"
        rows={3}
        autoSize
        maxRows={8}
        allowClear
        showCount
        maxLength={200}
        clearLabel="Очистить заметки"
        placeholder="Введите текст…"
      />
    </div>
  );
}
