import { MarkdownEditor } from '@dreadnought/ui/react';

export function MarkdownLinkDemo() {
  return (
    <MarkdownEditor
      aria-label="Markdown со ссылкой"
      defaultValue="Сайт проекта"
      defaultPreview="live"
      rows={4}
    />
  );
}
