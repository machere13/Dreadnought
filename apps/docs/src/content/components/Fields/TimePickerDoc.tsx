import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import {
  TimePickerDemo, TimePickerSecondsDemo, TimePickerLimitsDemo, TimePickerFormDemo,
} from './TimePickerDemo.tsx';

const catalog = getCatalogDoc('timepicker');
const apiNames = new Set([
  'value', 'defaultValue', 'onChange', 'showSeconds', 'minTime', 'maxTime',
  'hourStep', 'minuteStep', 'secondStep', 'disabledTime', 'open', 'onOpenChange',
  'disabled', 'readOnly', 'required', 'invalid', 'allowClear', 'placement',
]);

export const timePickerDoc: ComponentDoc = {
  ...catalog,
  title: 'TimePicker',
  description: 'Выбор времени с ручным вводом и отдельными колонками часов, минут и секунд.',
  adapterDescription: 'Поле, доступная панель и связь с формой без оформления.',
  logicDescription: 'useTimePicker управляет черновиком; расчёт времени и ограничений доступен отдельно в core.',
  apiRows: catalog.apiRows.filter(row => apiNames.has(row[0])).map(row =>
    row[0] === 'disabledTime' ? ['disabledTime', 'DisabledTime', '—', 'Недоступные часы, минуты и секунды'] : row),
  apiGroups: [{
    title: 'DisabledTime',
    rows: [
      ['hours', 'readonly number[]', '—', 'Недоступные часы'],
      ['minutes', '(hour: number) => readonly number[]', '—', 'Недоступные минуты выбранного часа'],
      ['seconds', '(hour: number, minute: number) => readonly number[]', '—', 'Недоступные секунды выбранной минуты'],
    ],
  }],
  demo: (
    <div style={{ display: 'grid', gap: '2rem', width: '100%' }}>
      <section><h3>Часы и минуты</h3><TimePickerDemo /></section>
      <section><h3>С секундами</h3><TimePickerSecondsDemo /></section>
      <section><h3>Ограничения и шаг</h3><TimePickerLimitsDemo /></section>
      <section><h3>С Form</h3><TimePickerFormDemo /></section>
    </div>
  ),
  footnote: <>
    Значение — HH:mm:ss или null. Без секунд ввод отображается как HH:mm, секунды равны 00.
    Шаг влияет на панель, но не округляет ручной ввод.
    Enter, подтверждение, уход фокуса или отправка формы принимают ввод; Escape отменяет его.
    Ошибочный черновик блокирует обычную отправку формы.
  </>,
};

export function TimePickerPage() {
  return <ComponentPage component="timepicker" doc={timePickerDoc} />;
}
