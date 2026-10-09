import { MarkdownPreview } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

export const markdownPreviewDoc: ComponentDoc = {
  ...getCatalogDoc('markdownpreview'), title: 'MarkdownPreview',
  description: 'Отображение Markdown с типографикой библиотеки: заголовки, списки, таблицы, ссылки и блоки кода.',
  adapterDescription: 'MarkdownPreviewAdapter разбирает CommonMark и GFM без оформления, пропускает сырой HTML и удаляет опасные URL.',
  logicDescription: 'Отображение относится к адаптеру, не к core. Для редактирования используйте MarkdownEditor и applyMarkdownCommand.',
  footnote: 'Не MDX: HTML, скрипты и код не выполняются. Произвольные плагины не подключаются. Внешние изображения могут загружаться из сети. Длинные таблицы и блоки кода прокручиваются внутри компонента.',
  demo: <div className={styles.demo}><MarkdownPreview value={'## Заметки\n\nТекст с **выделением** и ~~зачёркиванием~~.\n\n- [x] История\n- [x] Предпросмотр\n\n| Режим | Описание |\n| - | - |\n| edit | Текст |\n| live | Две панели |\n| preview | Отображение |\n\n```ts\nconst ready = true;\n```'} /></div>,
};
