import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { MarkdownPreviewDocumentDemo } from './MarkdownPreviewDocumentDemo.tsx';
import documentCode from './MarkdownPreviewDocumentDemo.tsx?raw';
import { MarkdownPreviewLiveDemo } from './MarkdownPreviewLiveDemo.tsx';
import liveCode from './MarkdownPreviewLiveDemo.tsx?raw';

export const markdownPreviewDoc: ComponentDoc = {
  ...getCatalogDoc('markdownpreview'),
  title: 'MarkdownPreview',
  usage:
    'Для чтения описаний и документов в Markdown. Если текст нужно менять, используйте MarkdownEditor.',
  primaryProps: ['value'],
  description:
    'Отображение Markdown с типографикой библиотеки: заголовки, списки, таблицы, ссылки и блоки кода.',
  adapterDescription:
    'MarkdownPreviewAdapter разбирает CommonMark и GFM без оформления, пропускает сырой HTML и удаляет опасные URL.',
  logicDescription:
    'Отображение относится к адаптеру, не к core. Для редактирования используйте MarkdownEditor и applyMarkdownCommand.',
  notes: [
    'Не MDX: HTML, скрипты и код не выполняются.',
    'Произвольные плагины не подключаются.',
    'Внешние изображения могут загружаться из сети.',
    'Длинные таблицы и блоки кода прокручиваются внутри компонента.',
  ],
  examples: [
    {
      id: 'document',
      title: 'Документ с таблицей и списком задач',
      description:
        'Строка value превращается в оформленный документ: заголовок, выделение, список задач, таблицу, цитату и блок кода. Отметки задач здесь только отображаются — редактируйте исходный Markdown, чтобы их изменить.',
      demo: <MarkdownPreviewDocumentDemo />,
      code: documentCode,
    },
    {
      id: 'live',
      title: 'Просмотр изменяемого текста',
      description:
        'Измените текст в поле: результат под ним обновится сразу. TextArea и MarkdownPreview получают одно состояние value. Для готового редактора с командами и переключением режимов используйте MarkdownEditor.',
      demo: <MarkdownPreviewLiveDemo />,
      code: liveCode,
    },
  ],
};

export function MarkdownPreviewPage() {
  return <ComponentPage component="markdownpreview" doc={markdownPreviewDoc} />;
}
