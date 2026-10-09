import { TextArea } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import styles from '../../../shared/Documentation.module.css';

function TextAreaDemo() {
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <label htmlFor="demo-notes">Заметки</label>
    <TextArea id="demo-notes" name="demo-notes" rows={3} autoSize maxRows={8} placeholder="Введите текст…" />
  </div>;
}

const textareaDoc: ComponentDoc = {
  ...getCatalogDoc('textarea'),
    title: 'TextArea',
    description: 'Многострочное поле с ручным изменением высоты или автоматическим ростом по содержимому.',
    adapterDescription: 'Адаптер сохраняет нативное поле и управление высотой, но не задаёт оформление.',
    logicDescription: <>При своей разметке передайте <code>textAreaRef</code> нативному элементу, чтобы работал autoSize.</>,
    footnote: <>Без <code>autoSize</code> поле можно растягивать мышью в пределах <code>minRows</code> и <code>maxRows</code>. С <code>autoSize</code> высота следует за текстом, а ручное растягивание отключено.</>,
    demo: <TextAreaDemo />,
  };

export function TextAreaPage() {
  return <ComponentPage component="textarea" doc={textareaDoc} />;
}
