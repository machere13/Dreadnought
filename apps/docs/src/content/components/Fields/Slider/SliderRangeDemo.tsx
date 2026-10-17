import { useState } from 'react';
import { Slider } from '@dreadnought/ui/react';

export function SliderRangeDemo() {
  const [range, setRange] = useState<[number, number]>([20, 80]);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p role="status">
        Цена: {range[0]}–{range[1]} ₽
      </p>
      <Slider
        range
        min={0}
        max={100}
        step={5}
        value={range}
        onValueChange={setRange}
        slotProps={{ thumb: [{ 'aria-label': 'Цена от' }, { 'aria-label': 'Цена до' }] }}
        tooltip={{ formatter: (next) => `${next} ₽` }}
      />
    </div>
  );
}
