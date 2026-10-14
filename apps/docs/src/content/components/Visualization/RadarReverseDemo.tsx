import { RadarChart } from '@dreadnought/ui/react';

const metrics = [
  { id: 'quality', label: 'Качество, баллы', domain: [0, 100] as const },
  { id: 'coverage', label: 'Покрытие, %', domain: [0, 100] as const },
  { id: 'latency', label: 'Задержка, мс', domain: [0, 200] as const, reverse: true },
];
const series = [
  { id: 'primary', label: 'Основной', values: { quality: 80, coverage: 70, latency: 60 } },
  { id: 'backup', label: 'Резервный', values: { quality: 60, coverage: 90, latency: 100 } },
];

export function RadarReverseDemo() {
  return (
    <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <RadarChart
        label="Сравнение сервисов"
        description="Условные показатели сервисов: качество и покрытие лучше при росте, задержка — при снижении."
        metrics={metrics}
        series={series}
        width={560}
        height={320}
      />
    </div>
  );
}
