import { useState } from 'react';
import { Slider } from '@dreadnought/ui/react';

export function SliderStepDemo() {
  const [value, setValue] = useState(0.4);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p role="status">Коэффициент: {value.toFixed(1)}</p>
      <Slider
        aria-label="Дробное значение"
        min={0}
        max={1}
        step={0.1}
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}
