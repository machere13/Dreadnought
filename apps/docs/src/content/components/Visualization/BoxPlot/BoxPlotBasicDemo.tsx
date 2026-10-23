import { BoxPlot } from '@dreadnought/ui/react';

const data = [
  { id: 'search', label: 'Поиск', values: [80, 90, 100, 110, 120, 130, 140, 150, 320] },
  { id: 'catalog', label: 'Каталог', values: [100, 120, 140, 160, 180, 200, 220, 240, 260] },
  { id: 'cart', label: 'Корзина', values: [70, 90, 100, 110, 120, 130, 140, 150, 160] },
];

export function BoxPlotBasicDemo() {
  return (
    <BoxPlot
      label="Время ответа сервисов"
      data={data}
      domain={[0, 400]}
      valueLabel="Время, мс"
      formatValue={(value) => `${value} мс`}
    />
  );
}
