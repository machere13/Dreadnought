import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { DatePickerDemo } from './DatePickerDemo.tsx';
import dateCode from './DatePickerDemo.tsx?raw';
import { DatePickerRangeDemo } from './DatePickerRangeDemo.tsx';
import rangeCode from './DatePickerRangeDemo.tsx?raw';
import { DatePickerFormDemo } from './DatePickerFormDemo.tsx';
import formCode from './DatePickerFormDemo.tsx?raw';

export const datePickerDoc: ComponentDoc = {
  ...getCatalogDoc('datepicker'),
  title: 'DatePicker',
  description:
    'Выберите одну дату или период в календаре либо введите даты вручную. Значение — строка YYYY-MM-DD, без времени и часового пояса.',
  adapterDescription: 'Поля, календарная сетка и клавиатура без оформления.',
  logicDescription:
    'useDatePicker управляет вводом; календарная арифметика доступна отдельно в core.',
  examples: [
    {
      id: 'single',
      title: 'Одна дата: календарь и ручной ввод',
      description:
        'Откройте календарь или введите 2026-10-20 и нажмите Enter. Под полем появится принятая дата; крестик очищает её до null. defaultValue задаёт начальную дату, дальнейшие изменения поле хранит само. locale="ru-RU" переводит календарь, но формат ввода остаётся YYYY-MM-DD.',
      demo: <DatePickerDemo />,
      code: dateCode,
    },
    {
      id: 'range',
      title: 'Период поездки в пределах года',
      description:
        'Выберите начало и конец поездки. Доступны даты с 2026-01-01 по 2026-12-31 включительно. До завершения выбора строка результата сохраняет предыдущий период. mode="range" возвращает пару дат или null; value и onChange связывают её с состоянием примера.',
      demo: <DatePickerRangeDemo />,
      code: rangeCode,
    },
    {
      id: 'form',
      title: 'Сохранение даты в Form',
      description:
        'Измените дату встречи и нажмите «Сохранить»: принятое значение появится под кнопками, без запроса к серверу. Ввод 2026-02-30 покажет ошибку и заблокирует отправку. «Сбросить» вернёт 2026-10-12 и уберёт результат. Здесь значением и сбросом управляет useForm.',
      demo: <DatePickerFormDemo />,
      code: formCode,
    },
  ],
  footnote: (
    <>
      Значение и ручной ввод: YYYY-MM-DD, без времени и часового пояса. Enter, уход фокуса или
      отправка формы подтверждают ввод; Escape отменяет его. disabledDate проверяет только начало и
      конец диапазона, не дни между ними. В управляемом режиме сброс выполняет родитель; обычная
      форма сбрасывает defaultValue. Невалидный или незавершённый ввод блокирует обычную отправку
      формы.
    </>
  ),
};

export function DatePickerPage() {
  return <ComponentPage component="datepicker" doc={datePickerDoc} />;
}
