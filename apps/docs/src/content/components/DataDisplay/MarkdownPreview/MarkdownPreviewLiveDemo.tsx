import { useState } from 'react';
import { MarkdownPreview, TextArea } from '@dreadnought/ui/react';

export function MarkdownPreviewLiveDemo() {
  const [value, setValue] = useState('## Заметки\n\nНапишите **свой текст**.');
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextArea
        aria-label="Исходный Markdown"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={5}
      />
      <section aria-label="Результат Markdown">
        <MarkdownPreview value={value} />
      </section>
    </div>
  );
}
