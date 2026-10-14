import { useState } from 'react';
import { Slider } from '@dreadnought/ui/react';

const marks: Record<number, string> = { 0: 'Мало', 30: 'Средне', 100: 'Много' };

export function SliderMarksDemo() {
  const [value, setValue] = useState(30);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p role="status">
        Уровень: {marks[value]} ({value})
      </p>
      <Slider
        aria-label="Уровень"
        step={null}
        marks={marks}
        value={value}
        onValueChange={setValue}
        tooltip={{ formatter: (next) => marks[next] }}
      />
    </div>
  );
}
