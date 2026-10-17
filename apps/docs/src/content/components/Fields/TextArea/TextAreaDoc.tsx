import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { TextAreaAutoSizeDemo } from './TextAreaAutoSizeDemo.tsx';
import autoSizeCode from './TextAreaAutoSizeDemo.tsx?raw';
import { TextAreaResizeDemo } from './TextAreaResizeDemo.tsx';
import resizeCode from './TextAreaResizeDemo.tsx?raw';
import { TextAreaAppearanceDemo } from './TextAreaAppearanceDemo.tsx';
import appearanceCode from './TextAreaAppearanceDemo.tsx?raw';

export const textareaDoc: ComponentDoc = {
  ...getCatalogDoc('textarea'),
  title: 'TextArea',
  usage:
    'Для заметок, комментариев и другого многострочного текста. Для форматированного документа с предпросмотром используйте MarkdownEditor.',
  primaryProps: [
    'rows',
    'autoSize',
    'minRows',
    'maxRows',
    'allowClear',
    'showCount',
    'disabled',
    'readOnly',
  ],
  description: 'Многострочное текстовое поле с автоматической или ручной настройкой высоты.',
  adapterDescription:
    'Адаптер сохраняет нативное поле и управление высотой, но не задаёт оформление.',
  logicDescription:
    'При своей разметке передайте textAreaRef нативному textarea, чтобы работал autoSize.',
  examples: [
    {
      id: 'auto-size',
      title: 'Заметки с автоматической высотой',
      description:
        'Введите несколько строк: autoSize увеличит высоту поля до восьми строк, затем появится внутренний скролл. Начальная высота — три строки. maxLength ограничивает ввод 200 символами, showCount показывает длину, крестик очищает заметку и возвращает фокус.',
      demo: <TextAreaAutoSizeDemo />,
      code: autoSizeCode,
    },
    {
      id: 'resize',
      title: 'Ручное изменение высоты',
      description:
        'Потяните за нижний угол поля. Без autoSize высоту можно менять вручную: rows задаёт начальные три строки, minRows и maxRows ограничивают её двумя и шестью строками. Сам ввод текста высоту не увеличивает.',
      demo: <TextAreaResizeDemo />,
      code: resizeCode,
    },
    {
      id: 'appearance',
      title: 'Компактное поле и поле без рамки',
      description:
        'Первое поле сочетает compact, filled и авторазмер до четырёх строк. Второе использует borderless и начальную высоту две строки. Это те же многострочные поля с разным оформлением, не отдельные типы данных.',
      demo: <TextAreaAppearanceDemo />,
      code: appearanceCode,
    },
  ],
  notes: [
    'autoSize отключает ручное растягивание.',
    'rows, minRows и maxRows задаются положительными целыми числами; minRows не должен превышать maxRows.',
    'className, style и ref относятся к самому textarea.',
    'Счётчик использует длину UTF-16, как нативный maxLength.',
  ],
};

export function TextAreaPage() {
  return <ComponentPage component="textarea" doc={textareaDoc} />;
}
