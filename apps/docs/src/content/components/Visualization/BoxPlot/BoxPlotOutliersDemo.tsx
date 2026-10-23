import { BoxPlot } from '@dreadnought/ui/react';

const data = [
  { id: 'batch', label: 'Партия датчиков', values: [-20, 18, 19, 20, 20, 20, 21, 22, 60, 60] },
];

export function BoxPlotOutliersDemo() {
  return (
    <BoxPlot
      label="Выбросы в измерениях температуры"
      data={data}
      domain={[-20, 60]}
      valueLabel="Температура, °C"
      formatValue={(value) => `${value} °C`}
    />
  );
}
