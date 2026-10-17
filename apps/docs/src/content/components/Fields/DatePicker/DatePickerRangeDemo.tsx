import { useId, useState } from 'react';
import { DatePicker } from '@dreadnought/ui/react';

export function DatePickerRangeDemo() {
  const id = useId();
  const [range, setRange] = useState<readonly [string, string] | null>([
    '2026-10-10',
    '2026-10-20',
  ]);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p id={id}>Период поездки</p>
      <DatePicker
        mode="range"
        aria-labelledby={id}
        value={range}
        onChange={setRange}
        minDate="2026-01-01"
        maxDate="2026-12-31"
        locale="ru-RU"
      />
      <p role="status">{range ? `Период: ${range[0]} — ${range[1]}` : 'Период не выбран'}</p>
    </div>
  );
}
