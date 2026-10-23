import { FunnelChart } from '@dreadnought/ui/react';

const data = Array.from({ length: 12 }, (_, index) => ({
  id: `step-${index}`,
  label: `Завершили шаг ${index + 1}`,
  value: 1200 - index * 100,
}));

export function FunnelChartStagesDemo() {
  return <FunnelChart label="Длинный процесс подключения" data={data} pageSize={4} />;
}
