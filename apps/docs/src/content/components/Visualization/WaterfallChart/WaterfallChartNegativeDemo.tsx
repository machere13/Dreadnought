import { WaterfallChart } from '@dreadnought/ui/react';

const data = [
  { id: 'start', label: 'На счёте', kind: 'start', value: 50 },
  { id: 'payment', label: 'Оплата подрядчику', kind: 'change', value: -80 },
  { id: 'subtotal', label: 'Задолженность', kind: 'total' },
  { id: 'income', label: 'Поступление', kind: 'change', value: 60 },
  { id: 'total', label: 'Баланс', kind: 'total' },
] as const;
const domain = [-100, 150] as const;

export function WaterfallChartNegativeDemo() {
  return <WaterfallChart label="Переход через ноль" data={data} domain={domain} />;
}
