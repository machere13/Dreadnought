import { PieChart } from '@dreadnought/ui/react';

const data = [
  { id: 'direct', label: 'Прямые переходы', value: 420 },
  { id: 'search', label: 'Поиск', value: 350 },
  { id: 'social', label: 'Социальные сети', value: 150 },
  { id: 'email', label: 'Рассылка', value: 80 },
];

export function PieBasicDemo() {
  return <PieChart label="Источники 1 000 посещений" data={data} />;
}
