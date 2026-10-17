import { useId, useState } from 'react';
import { TimePicker } from '@dreadnought/ui/react';

export function TimePickerDemo() {
  const id = useId();
  const [time, setTime] = useState<string | null>('09:30:00');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Время</label>
      <TimePicker id={id} defaultValue="09:30:00" onChange={setTime} />
      <p role="status">{time ? `Выбрано время: ${time}` : 'Время не выбрано'}</p>
    </div>
  );
}
