import { useState } from 'react';
import { MarkdownEditor } from '@dreadnought/ui/react';

export function MarkdownEditingDemo() {
  const [value, setValue] = useState('# Заметки\n\nВажная заметка');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <MarkdownEditor
        aria-label="Текст Markdown"
        value={value}
        onValueChange={setValue}
        autoSize
        minRows={4}
        maxRows={10}
      />
      <p role="status">Длина Markdown: {value.length}</p>
    </div>
  );
}
