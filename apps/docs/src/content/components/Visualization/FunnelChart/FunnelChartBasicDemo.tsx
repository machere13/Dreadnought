import { FunnelChart } from '@dreadnought/ui/react';

const data = [
  { id: 'visit', label: 'Посетили каталог', value: 1000 },
  { id: 'product', label: 'Открыли товар', value: 650 },
  { id: 'cart', label: 'Добавили в корзину', value: 400 },
  { id: 'paid', label: 'Оплатили', value: 100 },
];

export function FunnelChartBasicDemo() {
  return (
    <FunnelChart
      label="Путь к покупке"
      description="Уникальные пользователи за неделю"
      data={data}
    />
  );
}
