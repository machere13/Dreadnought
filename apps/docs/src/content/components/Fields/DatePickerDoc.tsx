import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { DatePickerDemo, DatePickerRangeDemo, DatePickerFormDemo } from './DatePickerDemo.tsx';

export const datePickerDoc: ComponentDoc = {
  ...getCatalogDoc('datepicker'),
  title: 'DatePicker',
  description: 'Выбор даты или диапазона с календарём, ручным вводом и ограничениями.',
  adapterDescription: 'Поля, календарная сетка и клавиатура без оформления.',
  logicDescription: 'useDatePicker управляет вводом; календарная арифметика доступна отдельно в core.',
  demo: (
    <div style={{ display: 'grid', gap: '2rem', width: '100%' }}>
      <section><h3>Дата</h3><DatePickerDemo /></section>
      <section><h3>Диапазон</h3><DatePickerRangeDemo /></section>
      <section><h3>С Form</h3><DatePickerFormDemo /></section>
    </div>
  ),
  footnote: <>
    Значение и ручной ввод: YYYY-MM-DD, без времени и часового пояса.
    Enter или уход фокуса подтверждает ввод; Escape отменяет его.
    disabledDate проверяет только начало и конец диапазона, не дни между ними.
      В управляемом режиме сброс выполняет родитель; обычная форма сбрасывает defaultValue.
      Клавиатурный поиск пропускает до 366 запрещённых дней. Для более длинных промежутков
      используйте выбор месяца и года.
  </>,
};

export function DatePickerPage() {
  return <ComponentPage component="datepicker" doc={datePickerDoc} />;
}
