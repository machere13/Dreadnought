import { MarkdownPreview } from '@dreadnought/ui/react';

const value = `## План выпуска

Проверяем **готовность** новой версии и ~~старый план~~.

- [x] Компоненты проверены
- [ ] Документация обновлена

| Раздел | Статус |
| --- | --- |
| Компоненты | Готово |
| Документация | В работе |

> Выпуск состоится после обновления документации.

\`\`\`ts
const ready = false;
\`\`\`
`;

export function MarkdownPreviewDocumentDemo() {
  return <MarkdownPreview value={value} aria-label="План выпуска в Markdown" />;
}
