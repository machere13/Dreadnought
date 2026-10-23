import { Gauge } from '@dreadnought/ui/react';

const thresholds = [
  { id: 'cold', label: 'Ниже нуля', to: 0 },
  { id: 'warm', label: 'Умеренно', to: 25 },
  { id: 'hot', label: 'Жарко', to: 40 },
];
export function GaugeRangeDemo() {
  return (
    <Gauge
      label="Температура снаружи"
      value={-5}
      min={-20}
      max={40}
      thresholds={thresholds}
      description="Диапазон от −20 до 40 °C. Отрицательная температура — обычное значение шкалы."
      formatValue={(value) => `${value} °C`}
    />
  );
}
