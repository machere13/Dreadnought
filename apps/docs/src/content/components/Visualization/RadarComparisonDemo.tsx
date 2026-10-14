import { useState } from 'react';
import { Button, RadarChart } from '@dreadnought/ui/react';

const metrics = [
  { id: 'quality', label: 'Качество', domain: [0, 100] as const },
  { id: 'coverage', label: 'Покрытие', domain: [0, 100] as const },
  { id: 'stability', label: 'Стабильность', domain: [0, 100] as const },
  { id: 'speed', label: 'Скорость', domain: [0, 100] as const },
  { id: 'usability', label: 'Удобство', domain: [0, 100] as const },
];
const series = [
  {
    id: 'v1',
    label: 'Версия 1.0',
    values: { quality: 80, coverage: 70, stability: 90, speed: 65, usability: 75 },
  },
  {
    id: 'v2',
    label: 'Версия 1.1',
    values: { quality: 85, coverage: 90, stability: 80, speed: 75, usability: 85 },
  },
];

export function RadarComparisonDemo() {
  const [visible, setVisible] = useState(series.map((item) => item.id));
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <RadarChart
        label="Сравнение версий"
        description="Условные оценки двух версий по пяти показателям, в баллах от 0 до 100."
        metrics={metrics}
        series={series}
        visibleSeries={visible}
        onVisibleSeriesChange={setVisible}
      />
      <Button
        style={{ justifySelf: 'start' }}
        variant="secondary"
        onClick={() => setVisible(series.map((item) => item.id))}
      >
        Показать все серии
      </Button>
    </div>
  );
}
