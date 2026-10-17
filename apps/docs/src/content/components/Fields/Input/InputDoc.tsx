import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { InputAppearanceDemo } from './InputAppearanceDemo.tsx';
import appearanceCode from './InputAppearanceDemo.tsx?raw';
import { InputSearchDemo } from './InputSearchDemo.tsx';
import searchCode from './InputSearchDemo.tsx?raw';
import { InputCountDemo } from './InputCountDemo.tsx';
import countCode from './InputCountDemo.tsx?raw';
import { InputEmailDemo } from './InputEmailDemo.tsx';
import emailCode from './InputEmailDemo.tsx?raw';
import { InputPasswordDemo } from './InputPasswordDemo.tsx';
import passwordCode from './InputPasswordDemo.tsx?raw';
import { InputNumberDemo } from './InputNumberDemo.tsx';
import numberCode from './InputNumberDemo.tsx?raw';

export const inputDoc: ComponentDoc = {
  ...getCatalogDoc('input'),
  title: 'Input',
  usage:
    'Для одной строки текста, почты, пароля или числа. Для длинного текста используйте TextArea. Всегда задавайте видимую подпись, а не только placeholder.',
  primaryProps: ['type', 'variant', 'controlSize', 'allowClear', 'prefix', 'suffix', 'invalid'],
  description: 'Однострочное поле для текста, почты, пароля или числа.',
  adapterDescription:
    'Адаптер создаёт поле и дополнительные кнопки без оформления. Для number шаг выполняет нативный input; готовый компонент использует Button.',
  logicDescription:
    'Хук возвращает inputProps с ref, visibilityButtonProps для пароля и stepButtonProps для числа. Передайте полученные свойства своим элементам.',
  examples: [
    {
      id: 'appearance',
      title: 'Оформление и компактный размер',
      description:
        'Введите текст в любое поле. outlined показывает рамку, filled — заполненный фон, borderless — поле без рамки. Среднее поле также использует controlSize="compact": размер не меняет смысл ввода.',
      demo: <InputAppearanceDemo />,
      code: appearanceCode,
    },
    {
      id: 'search',
      title: 'Поиск с иконкой и очисткой',
      description:
        'Введите «токены»: список сократится до одного документа. Иконка задаётся через prefix, а фильтрация — обработчиком onChange в примере. «Очистить поиск» вернёт все документы и фокус в поле. Для неизвестного запроса появится пустой результат.',
      demo: <InputSearchDemo />,
      code: searchCode,
    },
    {
      id: 'count',
      title: 'Название со счётчиком символов',
      description:
        'Измените начальное название Dreadnought: showCount обновляет счётчик, maxLength ограничивает ввод 30 символами. Крестик очищает текст и счётчик. defaultValue задаёт начальный текст; дальше поле хранит его само.',
      demo: <InputCountDemo />,
      code: countCode,
    },
    {
      id: 'email',
      title: 'Почта и нативная проверка формы',
      description:
        'Введите адрес и нажмите «Сохранить почту». type="email" и required используют проверку браузера: пустое поле или текст без @ не отправятся. Корректный адрес появится под кнопкой. Это обычная форма без модели useForm и без запроса к серверу.',
      demo: <InputEmailDemo />,
      code: emailCode,
    },
    {
      id: 'password',
      title: 'Пароль с переключением видимости',
      description:
        'Введите текст и нажмите иконку глаза. Видимость изменится без изменения самого значения; повторное нажатие скроет текст. passwordVisibilityLabels задаёт доступные названия кнопки «Показать пароль» и «Скрыть пароль».',
      demo: <InputPasswordDemo />,
      code: passwordCode,
    },
    {
      id: 'number',
      title: 'Количество с шагом и границами',
      description:
        'Наведите курсор или установите фокус: появятся кнопки шага от 0 до 10. Очистите поле — результат отличит пустую строку от нуля. Ручной ввод автоматически не обрезается до границ min и max.',
      demo: <InputNumberDemo />,
      code: numberCode,
    },
  ],
  notes: [
    'Поддерживаются стандартные свойства input.',
    'Управляемый value требует onChange или readOnly.',
    'Для number используйте min, max и step; step="any" отключает кнопки шага.',
    'className относится к обёртке.',
    'Счётчик и maxLength используют длину UTF-16; некоторые символы, например эмодзи, занимают две единицы.',
  ],
};

export function InputPage() {
  return <ComponentPage component="input" doc={inputDoc} />;
}
