import { useId, useState } from 'react';
import { TimePicker } from '@dreadnought/ui/react';

export function TimePickerSecondsDemo() {
  const id = useId();
  const [time, setTime] = useState<string | null>('09:30:15');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Время запуска</label>
      <TimePicker id={id} showSeconds value={time} onChange={setTime} />
      <p role="status">{time ? `Запуск: ${time}` : 'Время запуска не выбрано'}</p>
    </div>
  );
}
