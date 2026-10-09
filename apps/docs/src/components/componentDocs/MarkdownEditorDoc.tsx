import { useState } from 'react';
import { MarkdownEditor } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function MarkdownEditorDemo() {
  const [value, setValue] = useState('# Заметки\n\nВыделите текст и выберите форматирование.');
  return <div className={styles.demo}>
    <MarkdownEditor aria-label="Текст Markdown" value={value} onValueChange={setValue} defaultPreview="live" autoSize minRows={6} maxRows={14}
      uploadImage={async () => '/markdown-upload-demo.svg'} />
    <p>Выберите картинку кнопкой, вставьте её из буфера или перетащите одну картинку в текстовое поле. Вставка идёт в текущее выделение. Это локальная демонстрация: файл не отправляется на сервер, вставляется тестовое изображение.</p>
  </div>;
}

export const markdownEditorDoc: ComponentDoc = {
  ...getCatalogDoc('markdowneditor'),
  title: 'MarkdownEditor',
  description: 'Редактор Markdown с форматированием, общей историей ввода и команд, отменой Ctrl/Cmd+Z и режимами редактирования, предпросмотра и двух панелей.',
  adapterDescription: 'MarkdownEditorAdapter связывает textarea и команды core без стилей; свою панель передайте через renderToolbar.',
  logicDescription: 'useMarkdownEditor возвращает execute, undo/redo, preview/setPreview, insertImage/cancelImageUpload, состояние загрузки, значение, выделение и свойства textarea для своей разметки.',
  footnote: 'Иконка глаза включает предпросмотр, двух панелей — live, кода — edit. По умолчанию edit; defaultPreview задаёт начальный режим, preview/onPreviewChange — управляемый. Ctrl/Cmd+Z отменяет ввод и команды, Ctrl/Cmd+Shift+Z или Ctrl+Y повторяет. historyLimit ограничивает число полных снимков (100 по умолчанию). toolbar=false скрывает панель; labels переводит подписи. ref/className/style относятся к textarea. В controlled-режиме синхронно принимайте onValueChange; независимая внешняя замена текста сбрасывает историю. Preview поддерживает таблицы и списки задач, но не выполняет HTML и не загружает файлы. Внешние изображения могут обращаться к сети.',
  demo: <MarkdownEditorDemo />,
};
