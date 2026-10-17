import { useState } from 'react';
import { Slider } from '@dreadnought/ui/react';

export function SliderVolumeDemo() {
  const [value, setValue] = useState(25);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p role="status">Громкость: {value}%</p>
      <Slider
        aria-label="Громкость"
        value={value}
        onValueChange={setValue}
        tooltip={{ formatter: (next) => `${next}%` }}
      />
    </div>
  );
}
