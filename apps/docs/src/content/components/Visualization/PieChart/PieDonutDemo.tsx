import { useState } from 'react';
import { Button, PieChart } from '@dreadnought/ui/react';

const data = [
  { id: 'design', label: 'Дизайн', value: 24 },
  { id: 'development', label: 'Разработка', value: 56 },
  { id: 'testing', label: 'Тестирование', value: 20 },
];

export function PieDonutDemo() {
  const [visible, setVisible] = useState(data.map((item) => item.id));
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PieChart
        label="Распределение 100 часов работы"
        data={data}
        innerRadius={0.6}
        visibleItems={visible}
        onVisibleItemsChange={setVisible}
      />
      <Button
        variant="secondary"
        style={{ justifySelf: 'start' }}
        onClick={() => setVisible(data.map((item) => item.id))}
      >
        Показать все категории
      </Button>
    </div>
  );
}
