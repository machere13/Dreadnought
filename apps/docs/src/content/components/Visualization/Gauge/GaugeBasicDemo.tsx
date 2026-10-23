import { Gauge } from '@dreadnought/ui/react';

const thresholds = [
  { id: 'normal', label: 'Норма', to: 60 },
  { id: 'warning', label: 'Внимание', to: 80 },
  { id: 'critical', label: 'Критично', to: 100 },
];
export function GaugeBasicDemo() {
  return (
    <Gauge
      label="Загрузка сервера"
      value={72}
      thresholds={thresholds}
      description="72% попадает в диапазон «Внимание»: от 60% до 80%."
      formatValue={(value) => `${value}%`}
    />
  );
}
