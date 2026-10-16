import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { TimePickerDemo } from './TimePickerDemo.tsx';
import timeCode from './TimePickerDemo.tsx?raw';
import { TimePickerSecondsDemo } from './TimePickerSecondsDemo.tsx';
import secondsCode from './TimePickerSecondsDemo.tsx?raw';
import { TimePickerLimitsDemo } from './TimePickerLimitsDemo.tsx';
import limitsCode from './TimePickerLimitsDemo.tsx?raw';
import { TimePickerFormDemo } from './TimePickerFormDemo.tsx';
import formCode from './TimePickerFormDemo.tsx?raw';

const catalog = getCatalogDoc('timepicker');

export const timePickerDoc: ComponentDoc = {
  ...catalog,
  title: 'TimePicker',
  usage:
    'Для времени встречи или расписания без даты и часового пояса. Для календарной даты используйте DatePicker. Ввод — HH:mm, значение — HH:mm:ss.',
  primaryProps: [
    'value',
    'defaultValue',
    'onChange',
    'showSeconds',
    'minTime',
    'maxTime',
    'disabledTime',
    'minuteStep',
  ],
  description: 'Выбор времени в панели или ручным вводом, с необязательными секундами.',
  adapterDescription: 'Поле, доступная панель и связь с формой без оформления.',
  logicDescription:
    'useTimePicker управляет черновиком; расчёт времени и ограничений доступен отдельно в core.',
  apiRows: catalog.apiRows.map((row) =>
    row[0] === 'disabledTime'
      ? ['disabledTime', 'DisabledTime', '—', 'Недоступные часы, минуты и секунды']
      : row,
  ),
  apiGroups: [
    {
      title: 'DisabledTime',
      rows: [
        ['hours', 'readonly number[]', '—', 'Недоступные часы'],
        [
          'minutes',
          '(hour: number) => readonly number[]',
          '—',
          'Недоступные минуты выбранного часа',
        ],
        [
          'seconds',
          '(hour: number, minute: number) => readonly number[]',
          '—',
          'Недоступные секунды выбранной минуты',
        ],
      ],
    },
  ],
  examples: [
    {
      id: 'minutes',
      title: 'Часы и минуты',
      description:
        'Откройте панель, выберите часы и минуты и подтвердите выбор. Или введите 10:07 и нажмите Enter: результат будет 10:07:00. defaultValue задаёт начальное время; поле хранит изменения самостоятельно, onChange обновляет результат ниже. Крестик очищает значение до null.',
      demo: <TimePickerDemo />,
      code: timeCode,
    },
    {
      id: 'seconds',
      title: 'Точное время с секундами',
      description:
        'showSeconds добавляет третью колонку и формат ввода HH:mm:ss. Введите 09:30:45 и нажмите Enter либо выберите время в панели и подтвердите его. Строка «Запуск» покажет принятое значение. В этом примере время хранится в React через value и onChange.',
      demo: <TimePickerSecondsDemo />,
      code: secondsCode,
    },
    {
      id: 'limits',
      title: 'Рабочие часы, перерыв и шаг панели',
      description:
        'Доступно время с 09:00 до 18:00 включительно, кроме часа 13:00–13:59. В панели минуты идут с шагом 15. Попробуйте вручную 13:15 — появится ошибка, принятое значение не изменится. Ввод 10:07 допустим: minuteStep ограничивает панель, но не округляет ручной ввод.',
      demo: <TimePickerLimitsDemo />,
      code: limitsCode,
    },
    {
      id: 'form',
      title: 'Сохранение времени в Form',
      description:
        'Введите время и нажмите «Сохранить»: под кнопками появится значение HH:mm:ss, без запроса к серверу. Ввод 25:00 заблокирует отправку, а 10:07 сохранится как 10:07:00. «Сбросить» вернёт 09:30 и уберёт результат. Значением и сбросом управляет useForm.',
      demo: <TimePickerFormDemo />,
      code: formCode,
    },
  ],
  notes: [
    <>Значение — HH:mm:ss или null.</>,
    <>Без секунд ввод отображается как HH:mm, секунды равны 00.</>,
    <>Шаг влияет на панель, но не округляет ручной ввод.</>,
    <>Enter, подтверждение, уход фокуса или отправка формы принимают ввод; Escape отменяет его.</>,
    <>Ошибочный черновик блокирует обычную отправку формы.</>,
  ],
};

export function TimePickerPage() {
  return <ComponentPage component="timepicker" doc={timePickerDoc} />;
}
