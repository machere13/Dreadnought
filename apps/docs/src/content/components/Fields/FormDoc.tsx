import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { FormDemo } from './FormDemo.tsx';

export const formDoc: ComponentDoc = {
  ...getCatalogDoc('form'),
  title: 'Form',
  description:
    'Общая логика значений, проверок, ошибок и отправки для готовых и собственных полей.',
  adapterDescription: 'Нативная форма и доступные названия, подсказки и ошибки без оформления.',
  logicDescription:
    'useForm управляет проверками и отправкой; чистые функции core доступны без React.',
  demo: <FormDemo />,
  footnote: (
    <>
      Подключайте value/checked и обработчики явно. validateOn: blur по умолчанию, change или
      submit; перед отправкой проверки обязательны. Правила получают значения всей формы и signal.
      Храните функции правил стабильно. reset() восстанавливает начальные значения, reset(values)
      заменяет их. Объекты сравниваются по ссылке; вложенных путей и списков полей пока нет.
    </>
  ),
};

export function FormPage() {
  return <ComponentPage component="form" doc={formDoc} />;
}
