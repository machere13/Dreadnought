import { useId, useState } from 'react';
import { DatePicker } from '@dreadnought/ui/react';

export function DatePickerDemo() {
  const id = useId();
  const [date, setDate] = useState<string | null>('2026-10-12');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Дата</label>
      <DatePicker id={id} defaultValue="2026-10-12" onChange={setDate} locale="ru-RU" />
      <p role="status">{date ? `Выбрана дата: ${date}` : 'Дата не выбрана'}</p>
    </div>
  );
}
