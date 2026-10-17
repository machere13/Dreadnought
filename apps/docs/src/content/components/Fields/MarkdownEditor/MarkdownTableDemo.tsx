import { MarkdownEditor } from '@dreadnought/ui/react';

export function MarkdownTableDemo() {
  return (
    <MarkdownEditor
      aria-label="Markdown с таблицей"
      defaultValue=""
      defaultPreview="live"
      rows={7}
    />
  );
}
