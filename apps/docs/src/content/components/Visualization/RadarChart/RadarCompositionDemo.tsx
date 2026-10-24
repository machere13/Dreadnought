import { Button, RadarChart, useRadarChart } from '@dreadnought/ui/react';
import type { RadarChartDrawingContext } from '@dreadnought/ui/react';

const metrics = [
  { id: 'quality', label: 'Качество', domain: [0, 100] as const },
  { id: 'coverage', label: 'Покрытие', domain: [0, 100] as const },
  { id: 'speed', label: 'Скорость', domain: [0, 100] as const },
  { id: 'stability', label: 'Надёжность', domain: [0, 100] as const },
];
const series = [
  { id: 'v1', label: 'Версия 1', values: { quality: 80, coverage: 65, speed: 70, stability: 90 } },
  { id: 'v2', label: 'Версия 2', values: { quality: 90, coverage: 85, speed: 80, stability: 75 } },
];
function Controls() {
  const { visible, toggle } = useRadarChart();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <p>Видимых серий: {visible.length}</p>
      <Button variant="secondary" onClick={() => toggle('v1')}>
        Переключить версию 1
      </Button>
    </div>
  );
}
function Drawing({ layout, visible }: RadarChartDrawingContext) {
  const { slotProps } = useRadarChart();
  return (
    <>
      <g fill="none" stroke="currentColor" opacity="0.2">
        {[25, 50, 75, 100].map((radius) => (
          <circle key={radius} r={radius} />
        ))}
        {layout.axes.map((axis) => (
          <line key={axis.id} x1="0" y1="0" x2={axis.x} y2={axis.y} />
        ))}
      </g>
      {layout.axes.map((axis) => (
        <text
          key={axis.id}
          x={axis.x * 1.15}
          y={axis.y * 1.15}
          textAnchor="middle"
          fill="currentColor"
          fontSize="9"
        >
          {axis.label}
        </text>
      ))}
      {layout.seriesPoints.map(
        (item, index) =>
          visible.includes(item.id) && (
            <polygon
              key={item.id}
              className={slotProps.series?.(series[index])?.className}
              points={item.points.map((point) => `${point.x},${point.y}`).join(' ')}
              style={{ fill: 'none', strokeWidth: 3 }}
            />
          ),
      )}
    </>
  );
}
export function RadarCompositionDemo() {
  return (
    <RadarChart label="Своя сетка и контуры RadarChart" metrics={metrics} series={series}>
      <Controls />
      <RadarChart.Legend>
        {({ series, visible }) => (
          <span>
            {series.label} · {visible ? 'видна' : 'скрыта'}
          </span>
        )}
      </RadarChart.Legend>
      <RadarChart.Plot
        tooltipContent={({ defaultContent }) => (
          <>
            {defaultContent}
            <p>Исходные баллы, не нормализованная доля.</p>
          </>
        )}
      >
        {(context) => <Drawing {...context} />}
      </RadarChart.Plot>
      <RadarChart.Table />
    </RadarChart>
  );
}
