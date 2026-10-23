import { Gauge } from '@dreadnought/ui/react';

export function GaugeCircleDemo() {
  return (
    <Gauge
      label="Выполнение плана"
      variant="circle"
      value={138}
      max={200}
      description="Выполнено 138 задач из 200. Круговая шкала оставляет разрыв между минимумом и максимумом."
      formatValue={(value) => `${value} задач`}
    />
  );
}
