import { useState } from 'react';
import { Slider } from '@dreadnought/ui/react';

const marks = { 0: '0', 30: '30', 70: '70', 100: '100' };

export function SliderVerticalDemo() {
  const [range, setRange] = useState<[number, number]>([30, 70]);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p role="status">
        Вертикальный диапазон: {range[0]}–{range[1]}
      </p>
      <Slider
        orientation="vertical"
        style={{ height: '12rem' }}
        range
        step={null}
        marks={marks}
        value={range}
        onValueChange={setRange}
        slotProps={{
          thumb: [
            { 'aria-label': 'Вертикальный минимум' },
            { 'aria-label': 'Вертикальный максимум' },
          ],
        }}
      />
    </div>
  );
}
