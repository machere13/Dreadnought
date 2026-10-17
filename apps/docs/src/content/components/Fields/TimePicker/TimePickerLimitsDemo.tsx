import { useId, useState } from 'react';
import { TimePicker } from '@dreadnought/ui/react';

export function TimePickerLimitsDemo() {
  const id = useId();
  const [time, setTime] = useState<string | null>('09:30:00');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Рабочее время</label>
      <TimePicker
        id={id}
        value={time}
        onChange={setTime}
        minTime="09:00:00"
        maxTime="18:00:00"
        minuteStep={15}
        disabledTime={{ hours: [13] }}
      />
      <p role="status">{time ? `Выбрано время: ${time}` : 'Время не выбрано'}</p>
    </div>
  );
}
