import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { MarkdownEditingDemo } from './MarkdownEditingDemo.tsx';
import editingCode from './MarkdownEditingDemo.tsx?raw';
import { MarkdownPreviewDemo } from './MarkdownPreviewDemo.tsx';
import previewCode from './MarkdownPreviewDemo.tsx?raw';
import { MarkdownHistoryDemo } from './MarkdownHistoryDemo.tsx';
import historyCode from './MarkdownHistoryDemo.tsx?raw';
import { MarkdownLinkDemo } from './MarkdownLinkDemo.tsx';
import linkCode from './MarkdownLinkDemo.tsx?raw';
import { MarkdownImageDemo } from './MarkdownImageDemo.tsx';
import imageCode from './MarkdownImageDemo.tsx?raw';
import { MarkdownTableDemo } from './MarkdownTableDemo.tsx';
import tableCode from './MarkdownTableDemo.tsx?raw';

export const markdownEditorDoc: ComponentDoc = {
  ...getCatalogDoc('markdowneditor'),
  title: 'MarkdownEditor',
  description:
    'Редактирует текст Markdown и показывает результат. Панель вставляет разметку для форматирования, ссылок, изображений и таблиц; история объединяет ручной ввод и команды.',
  adapterDescription:
    'MarkdownEditorAdapter связывает textarea и команды core без стилей; свою панель передайте через renderToolbar.',
  logicDescription:
    'useMarkdownEditor возвращает execute, undo/redo, preview/setPreview, insertImage/cancelImageUpload, состояние загрузки, значение, выделение и свойства textarea для своей разметки.',
  footnote:
    'Ctrl/Cmd+Z — отмена; Ctrl/Cmd+Shift+Z или Ctrl+Y — повтор. В controlled-режиме синхронно принимайте onValueChange: внешняя замена текста сбрасывает историю. Preview не выполняет HTML; внешние изображения могут обращаться к сети.',
  examples: [
    {
      id: 'editing',
      title: 'Текст и форматирование',
      description:
        'Выделите «Важная заметка» и нажмите «Жирный»: в исходнике появится **Важная заметка**. Можно также добавлять заголовки, списки, цитаты и код. value хранит строку Markdown, onValueChange синхронно принимает ввод и команды. Счётчик ниже показывает длину исходника, включая разметку.',
      demo: <MarkdownEditingDemo />,
      code: editingCode,
    },
    {
      id: 'preview',
      title: 'Редактирование, предпросмотр и две панели',
      description:
        'Изначально видны исходник и результат рядом. Переключите «Предпросмотр», затем «Редактирование» или «Текст и предпросмотр» на панели. Режим хранится отдельно через preview и onPreviewChange; текст при переключении не теряется. В режиме одного предпросмотра форматирование недоступно.',
      demo: <MarkdownPreviewDemo />,
      code: previewCode,
    },
    {
      id: 'history',
      title: 'Отмена и повтор изменений',
      description:
        'Измените текст или выделите его и примените форматирование. «Отменить» вернёт предыдущий текст, «Повторить» восстановит изменение. Ctrl/Cmd+Z отменяет, Ctrl/Cmd+Shift+Z или Ctrl+Y повторяет. В этом примере historyLimit хранит до 20 снимков; новая правка после отмены очищает повтор.',
      demo: <MarkdownHistoryDemo />,
      code: historyCode,
    },
    {
      id: 'link',
      title: 'Вставка ссылки',
      description:
        'Выделите «Сайт проекта» и нажмите «Ссылка». Получится [Сайт проекта](url), а url будет выделен для замены. Введите https://example.com — справа появится ссылка с выбранной подписью. Команда вставляет Markdown, отдельное окно ввода адреса не открывается.',
      demo: <MarkdownLinkDemo />,
      code: linkCode,
    },
    {
      id: 'image',
      title: 'Изображение через обработчик загрузки',
      description:
        'Перетащите одно изображение в поле или нажмите «Изображение» и выберите файл. Демонстрационный uploadImage возвращает URL тестового SVG, не отправляя файл. Редактор вставит Markdown и покажет картинку справа. Для своего проекта замените URL и подключите реальную загрузку; пример зависит от SVG в документации.',
      demo: <MarkdownImageDemo />,
      code: imageCode,
    },
    {
      id: 'table',
      title: 'Таблица Markdown',
      description:
        'Нажмите «Таблица»: появится шаблон с двумя столбцами и тремя строками данных. Первый Header выделен для замены. Измените заголовки и Cell в исходнике — результат справа обновится. Вертикальные черты разделяют ячейки, строка дефисов отделяет заголовок.',
      demo: <MarkdownTableDemo />,
      code: tableCode,
    },
  ],
};

export function MarkdownEditorPage() {
  return <ComponentPage component="markdowneditor" doc={markdownEditorDoc} />;
}
