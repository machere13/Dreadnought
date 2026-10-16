import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { DatePickerDemo } from './DatePickerDemo.tsx';
import dateCode from './DatePickerDemo.tsx?raw';
import { DatePickerRangeDemo } from './DatePickerRangeDemo.tsx';
import rangeCode from './DatePickerRangeDemo.tsx?raw';
import { DatePickerFormDemo } from './DatePickerFormDemo.tsx';
import formCode from './DatePickerFormDemo.tsx?raw';
import { DatePickerLimitsDemo } from './DatePickerLimitsDemo.tsx';
import limitsCode from './DatePickerLimitsDemo.tsx?raw';

export const datePickerDoc: ComponentDoc = {
  ...getCatalogDoc('datepicker'),
  title: 'DatePicker',
  description: 'Выбор одной даты или периода — в календаре или с помощью ручного ввода.',
  usage: (
    <p>
      Для даты встречи, доставки или поездки. Значение и ввод — <code>YYYY-MM-DD</code>, без времени
      и часового пояса. Для выбора времени используйте{' '}
      <a href="/components/timepicker/">TimePicker</a>.
    </p>
  ),
  adapterDescription:
    'DatePickerAdapter сохраняет поля, календарь и клавиатурное управление. Вы задаёте оформление сами.',
  logicDescription: (
    <>
      useDatePicker управляет значением, черновиком и календарём. Разметку и отображение ошибок
      задаёте вы. Отдельные вычисления дат доступны в <a href="/core/domains/">Core → Domains</a>,
      цикл подтверждения и отмены — в{' '}
      <a href="/core/patterns/#get-draft-transition">Core → Patterns</a>.
    </>
  ),
  primaryProps: [
    'mode',
    'value',
    'defaultValue',
    'onChange',
    'minDate',
    'maxDate',
    'disabledDate',
    'allowClear',
  ],
  examples: [
    {
      id: 'single',
      title: 'Выбор одной даты',
      description:
        'Выберите день в календаре или введите 2026-10-20 и нажмите Enter. Результат появится под полем. Крестик очищает дату.',
      demo: <DatePickerDemo />,
      code: dateCode,
    },
    {
      id: 'range',
      title: 'Выбор периода',
      description:
        'Выберите начало и конец поездки в 2026 году. Результат обновится только после выбора обеих дат. В этом примере значение хранится в React-состоянии.',
      demo: <DatePickerRangeDemo />,
      code: rangeCode,
    },
    {
      id: 'limits',
      title: 'Ограничение доступных дат',
      description:
        'Доставка доступна с 12 по 16 октября 2026 года включительно. Введите 2026-10-20: поле покажет ошибку, а принятая дата не изменится.',
      demo: <DatePickerLimitsDemo />,
      code: limitsCode,
    },
    {
      id: 'form',
      title: 'Сохранение в форме',
      description:
        'Измените дату и нажмите «Сохранить» — результат появится под кнопками, без отправки на сервер. «Сбросить» вернёт начальную дату. Попробуйте 2026-02-30: ошибка заблокирует сохранение.',
      demo: <DatePickerFormDemo />,
      code: formCode,
    },
  ],

  notes: [
    <>
      Enter, уход фокуса или отправка формы подтверждают ручной ввод. Escape возвращает последнее
      принятое значение.
    </>,
    <>
      Незавершённый или ошибочный ввод остаётся в поле, не меняет значение и блокирует обычную
      отправку формы.
    </>,
    <>
      В режиме <code>range</code> возвращается пара дат или <code>null</code>. Пока выбрана только
      первая дата, прежнее значение сохраняется.
    </>,
    <>
      <code>minDate</code> и <code>maxDate</code> включительны. <code>disabledDate</code> проверяет
      края диапазона, не дни между ними.
    </>,
    <>
      <code>locale="ru-RU"</code> переводит календарь, но не меняет формат ручного ввода.
    </>,
    <>
      <code>defaultValue</code> задаёт начальное значение. При <code>value</code> изменение и сброс
      контролирует родитель; обычная неуправляемая форма возвращает <code>defaultValue</code> при
      сбросе.
    </>,
  ],
};

export function DatePickerPage() {
  return <ComponentPage component="datepicker" doc={datePickerDoc} />;
}
