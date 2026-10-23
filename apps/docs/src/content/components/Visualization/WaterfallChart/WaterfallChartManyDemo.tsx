import { WaterfallChart } from '@dreadnought/ui/react';
import type { WaterfallDatum } from '@dreadnought/core';

const data: WaterfallDatum[] = [
  { id: 'start', label: 'Начальный запас', kind: 'start', value: 100 },
  ...Array.from({ length: 18 }, (_, index): WaterfallDatum => ({
    id: `day-${index}`,
    label: `День ${index + 1}`,
    kind: 'change',
    value: index % 2 ? -5 : 10,
  })),
  { id: 'total', label: 'Осталось на складе', kind: 'total' },
];
export function WaterfallChartManyDemo() {
  return <WaterfallChart label="Движение запасов" data={data} pageSize={5} />;
}
