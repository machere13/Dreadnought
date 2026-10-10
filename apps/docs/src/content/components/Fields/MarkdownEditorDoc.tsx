import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { useState } from 'react';
import { MarkdownEditor } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

function MarkdownEditorDemo() {
  const [value, setValue] = useState('# Заметки\n\nВыделите текст и выберите форматирование.');
  return <div className={styles.demo}>
    <MarkdownEditor aria-label="Текст Markdown" value={value} onValueChange={setValue} defaultPreview="live" autoSize minRows={6} maxRows={14}
      uploadImage={async () => '/markdown-upload-demo.svg'} />
    <p>Загрузка здесь демонстрационная: файл не отправляется на сервер, вставляется тестовое изображение.</p>
  </div>;
}

export const markdownEditorDoc: ComponentDoc = {
  ...getCatalogDoc('markdowneditor'),
  title: 'MarkdownEditor',
  description: 'Редактор Markdown с форматированием, общей историей ввода и команд, отменой Ctrl/Cmd+Z и режимами редактирования, предпросмотра и двух панелей.',
  adapterDescription: 'MarkdownEditorAdapter связывает textarea и команды core без стилей; свою панель передайте через renderToolbar.',
  logicDescription: 'useMarkdownEditor возвращает execute, undo/redo, preview/setPreview, insertImage/cancelImageUpload, состояние загрузки, значение, выделение и свойства textarea для своей разметки.',
  footnote: 'Ctrl/Cmd+Z — отмена; Ctrl/Cmd+Shift+Z или Ctrl+Y — повтор. В controlled-режиме синхронно принимайте onValueChange: внешняя замена текста сбрасывает историю. Preview не выполняет HTML; внешние изображения могут обращаться к сети.',
  demo: <MarkdownEditorDemo />,
};

export function MarkdownEditorPage() {
  return <ComponentPage component="markdowneditor" doc={markdownEditorDoc} />;
}
