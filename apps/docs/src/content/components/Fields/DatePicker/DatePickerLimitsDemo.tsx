import { useId, useState } from 'react';
import { DatePicker } from '@dreadnought/ui/react';

export function DatePickerLimitsDemo() {
  const id = useId();
  const [date, setDate] = useState<string | null>('2026-10-12');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Дата доставки</label>
      <DatePicker
        id={id}
        value={date}
        onChange={setDate}
        minDate="2026-10-12"
        maxDate="2026-10-16"
        locale="ru-RU"
      />
      <p role="status">{date ? `Доставка: ${date}` : 'Дата не выбрана'}</p>
    </div>
  );
}
