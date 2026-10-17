import { useState } from 'react';
import { Button, RadarChart } from '@dreadnought/ui/react';

const indicators = [
  { id: 'quality', label: 'Качество', score: 80 },
  { id: 'coverage', label: 'Покрытие', score: 70 },
  { id: 'stability', label: 'Стабильность', score: 90 },
  { id: 'speed', label: 'Скорость', score: 65 },
  { id: 'availability', label: 'Доступность', score: 85 },
  { id: 'usability', label: 'Удобство', score: 75 },
];
const choices = [
  { count: 3, label: '3 оси' },
  { count: 4, label: '4 оси' },
  { count: 5, label: '5 осей' },
  { count: 6, label: '6 осей' },
];

export function RadarAxesDemo() {
  const [count, setCount] = useState(5);
  const selected = indicators.slice(0, count);
  const metrics = selected.map(({ id, label }) => ({ id, label, domain: [0, 100] as const }));
  const series = [
    {
      id: 'product',
      label: 'Оценка продукта',
      values: Object.fromEntries(selected.map(({ id, score }) => [id, score])),
    },
  ];
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {choices.map((choice) => (
          <Button
            key={choice.count}
            variant={choice.count === count ? 'primary' : 'secondary'}
            aria-pressed={choice.count === count}
            onClick={() => setCount(choice.count)}
          >
            {choice.label}
          </Button>
        ))}
      </div>
      <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <RadarChart
          label="Количество осей"
          description="Один показатель создаёт одну ось. Оценки условные, от 0 до 100 баллов."
          metrics={metrics}
          series={series}
          width={560}
          height={320}
        />
      </div>
    </div>
  );
}
