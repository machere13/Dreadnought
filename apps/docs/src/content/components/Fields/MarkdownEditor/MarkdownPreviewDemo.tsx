import { useState } from 'react';
import { MarkdownEditor } from '@dreadnought/ui/react';

const modes = { edit: 'редактирование', live: 'текст и предпросмотр', preview: 'предпросмотр' };

export function MarkdownPreviewDemo() {
  const [mode, setMode] = useState<'edit' | 'live' | 'preview'>('live');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <MarkdownEditor
        aria-label="Markdown с предпросмотром"
        defaultValue={'# План\n\n- Написать текст\n- Проверить результат\n\n**Готово**'}
        preview={mode}
        onPreviewChange={setMode}
        rows={6}
      />
      <p role="status">Режим: {modes[mode]}</p>
    </div>
  );
}
