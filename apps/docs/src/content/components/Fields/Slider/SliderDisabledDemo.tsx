import { Slider } from '@dreadnought/ui/react';

export function SliderDisabledDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p>Недоступное значение: 50</p>
      <Slider aria-label="Недоступное значение" disabled defaultValue={50} />
    </div>
  );
}
