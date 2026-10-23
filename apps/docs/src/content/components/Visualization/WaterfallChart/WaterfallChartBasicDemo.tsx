import { WaterfallChart } from '@dreadnought/ui/react';

const data = [
  { id: 'start', label: 'Начало месяца', kind: 'start', value: 100 },
  { id: 'sales', label: 'Продажи', kind: 'change', value: 40 },
  { id: 'subtotal', label: 'После продаж', kind: 'total' },
  { id: 'rent', label: 'Аренда', kind: 'change', value: -25 },
  { id: 'total', label: 'Остаток', kind: 'total' },
] as const;

export function WaterfallChartBasicDemo() {
  return (
    <WaterfallChart
      label="Изменение бюджета"
      description="Суммы в тысячах рублей за месяц"
      data={data}
      formatValue={(value) => `${value} тыс. ₽`}
    />
  );
}
