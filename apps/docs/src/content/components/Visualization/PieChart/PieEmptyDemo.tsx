import { useState } from 'react';
import { Button, PieChart } from '@dreadnought/ui/react';

export function PieEmptyDemo() {
  const [value, setValue] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PieChart
        label="Заказы за сегодня"
        innerRadius={0.6}
        data={[{ id: 'orders', label: 'Оплаченные', value }]}
      />
      <Button
        variant="secondary"
        style={{ justifySelf: 'start' }}
        onClick={() => setValue((current) => (current === 0 ? 12 : 0))}
      >
        {value === 0 ? 'Добавить 12 заказов' : 'Обнулить заказы'}
      </Button>
    </div>
  );
}
