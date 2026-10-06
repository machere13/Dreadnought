import { useState } from 'react';
import { MarkdownEditor } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function MarkdownEditorDemo() {
  const [value, setValue] = useState('# Заметки\n\nВыделите текст и выберите форматирование.');
  return <div className={styles.demo}>
    <MarkdownEditor aria-label="Текст Markdown" value={value} onValueChange={setValue} autoSize minRows={6} maxRows={14} />
  </div>;
}

export const markdownEditorDoc: ComponentDoc = {
  ...getCatalogDoc('markdowneditor'),
  title: 'MarkdownEditor',
  description: 'Поле Markdown с компактной панелью: выделение текста, форматирование и продолжение списков. Без preview и собственной истории undo.',
  adapterDescription: 'MarkdownEditorAdapter связывает textarea и команды core без стилей; свою панель передайте через renderToolbar.',
  logicDescription: 'useMarkdownEditor возвращает execute, значение, выделение и свойства textarea для своей разметки.',
  footnote: 'Встроены жирный, курсив, зачёркивание, H2, цитата, два вида списков, код, блок кода, ссылка, изображение и таблица. Для ссылки и изображения вставляется редактируемый шаблон, загрузки файлов нет. toolbar=false скрывает панель; labels переводит подписи. ref, className и style относятся к textarea. В controlled-режиме синхронно принимайте onValueChange. Программные команды могут не попасть в нативную undo-историю.',
  demo: <MarkdownEditorDemo />,
};
