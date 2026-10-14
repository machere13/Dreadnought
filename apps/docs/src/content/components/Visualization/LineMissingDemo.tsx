import { LineChart } from '@dreadnought/ui/react';

const series = [
  {
    id: 'temperature',
    label: 'Температура',
    data: [
      { x: 0, y: 18 },
      { x: 1, y: 20 },
      { x: 2, y: null },
      { x: 3, y: 21 },
      { x: 4, y: 24 },
    ],
  },
];

export function LineMissingDemo() {
  return (
    <LineChart
      label="Температура с пропуском"
      description="В 2 часа измерение отсутствует: это не нулевая температура."
      series={series}
      xDomain={[0, 4]}
      yDomain={[0, 30]}
      xLabel="Время, ч"
      yLabel="Температура, °C"
      formatX={(value) => `${value} ч`}
      formatY={(value) => `${value} °C`}
      zoom={false}
    />
  );
}
