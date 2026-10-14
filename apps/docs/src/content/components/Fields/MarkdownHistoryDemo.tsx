import { MarkdownEditor } from '@dreadnought/ui/react';

export function MarkdownHistoryDemo() {
  return (
    <MarkdownEditor
      aria-label="История Markdown"
      defaultValue="Первая версия"
      historyLimit={20}
      autoSize
      minRows={3}
      maxRows={8}
    />
  );
}
