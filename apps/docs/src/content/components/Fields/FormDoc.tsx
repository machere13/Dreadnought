import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { FormDemo } from './FormDemo.tsx';
import advancedCode from './FormDemo.tsx?raw';
import { FormBasicDemo } from './FormBasicDemo.tsx';
import basicCode from './FormBasicDemo.tsx?raw';

export const formDoc: ComponentDoc = {
  ...getCatalogDoc('form'),
  title: 'Form',
  description:
    'Объединяет значения полей, проверяет их перед отправкой и показывает ошибки. useForm хранит состояние, Form связывает модель с отправкой и сбросом, FormField — подпись и ошибку с полем.',
  adapterDescription: 'Нативная форма и доступные названия, подсказки и ошибки без оформления.',
  logicDescription:
    'useForm управляет проверками и отправкой; чистые функции core доступны без React.',
  examples: [
    {
      id: 'basic',
      title: 'Одно поле: проверка, сохранение и сброс',
      description:
        'Нажмите «Сохранить имя» с пустым полем — появится «Введите имя». Введите имя и сохраните: результат появится под кнопками, без запроса к серверу. «Очистить форму» вернёт начальное пустое значение и уберёт результат. value, onChange и onBlur подключаются к полю явно.',
      demo: <FormBasicDemo />,
      code: basicCode,
    },
    {
      id: 'fields',
      title: 'Связанные поля и разные контроли',
      description:
        'Введите имя, пароль из шести или более символов и совпадающее подтверждение. Выберите роль и примите условия. Имя admin зарезервировано локальной асинхронной проверкой. «Сохранить» покажет имя, роль и согласие — пароли в результат не выводятся. Ошибки проверяются при уходе из поля и перед отправкой; сброс очищает всю форму.',
      demo: <FormDemo />,
      code: advancedCode,
    },
  ],
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
