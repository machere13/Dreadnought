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
  usage:
    'Для связанных полей с проверкой, отправкой и сбросом. FormField связывает подпись и ошибку с конкретным полем; состояние хранит useForm.',
  primaryProps: [
    'form',
    'onFinish',
    'FormField.label',
    'FormField.error',
    'FormField.help',
    'FormField.required',
    'FormField.children',
  ],
  description: 'Форма со связанными значениями полей, проверками, отправкой и сбросом.',
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
        'Заполните имя, пароль от шести символов, совпадающее подтверждение, роль и согласие. Имя admin зарезервировано. «Сохранить» покажет результат без паролей; «Сбросить» очистит форму. Проверка имени имитируется локально.',
      demo: <FormDemo />,
      code: advancedCode,
    },
  ],
  notes: [
    <>Подключайте value/checked и обработчики явно.</>,
    <>validateOn: blur по умолчанию, change или submit; перед отправкой проверки обязательны.</>,
    <>Правила получают значения всей формы и signal.</>,
    <>Храните функции правил стабильно.</>,
    <>reset() восстанавливает начальные значения, reset(values) заменяет их.</>,
    <>Объекты сравниваются по ссылке; вложенных путей и списков полей пока нет.</>,
  ],
};

export function FormPage() {
  return <ComponentPage component="form" doc={formDoc} />;
}
