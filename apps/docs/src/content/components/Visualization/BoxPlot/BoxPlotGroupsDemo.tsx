import { BoxPlot } from '@dreadnought/ui/react';

const data = Array.from({ length: 12 }, (_, index) => ({
  id: `team-${index}`,
  label: `Команда ${index + 1}`,
  values: Array.from({ length: 1000 }, (_, sample) => 10 + ((sample * 17 + index * 11) % 70)),
}));

export function BoxPlotGroupsDemo() {
  return (
    <BoxPlot
      label="12 команд — 12 000 наблюдений"
      data={data}
      domain={[0, 100]}
      valueLabel="Время, мин"
      pageSize={3}
    />
  );
}
