import { Gauge, useGauge } from '@dreadnought/ui/react';

const thresholds = [
  { id: 'normal', label: 'Норма', to: 60 },
  { id: 'warning', label: 'Внимание', to: 100 },
];
function Reading() {
  const { layout, active, formatValue } = useGauge();
  return (
    <p>
      Показание: {layout.value === null ? 'Нет данных' : formatValue(layout.value)} ·{' '}
      {active?.label}
    </p>
  );
}
export function GaugeCompositionDemo() {
  return (
    <Gauge
      label="Линейная шкала из Gauge"
      value={72}
      thresholds={thresholds}
      formatValue={(value) => `${value}%`}
    >
      <Reading />
      <Gauge.Plot
        tooltipContent={({ defaultContent }) => (
          <>
            {defaultContent}
            <p>Положение и состояние рассчитаны Gauge.</p>
          </>
        )}
      >
        {({ layout, active, labels, formatValue }) => (
          <>
            <svg viewBox="0 0 200 42" aria-hidden="true">
              <rect
                x="0"
                y="12"
                width="200"
                height="14"
                rx="7"
                fill="currentColor"
                opacity="0.15"
              />
              <rect
                x="0"
                y="12"
                width={200 * (layout.ratio ?? 0)}
                height="14"
                rx="7"
                fill="currentColor"
              />
              {layout.ratio !== null && (
                <line
                  x1={200 * layout.ratio}
                  x2={200 * layout.ratio}
                  y1="6"
                  y2="32"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              )}
            </svg>
            <span data-ui="gauge-limits">
              <span>{formatValue(layout.min)}</span>
              <span>{formatValue(layout.max)}</span>
            </span>
            <strong data-ui="gauge-value">
              {layout.value === null ? labels.empty : formatValue(layout.value)}
            </strong>
            <span data-ui="gauge-status">{active?.label}</span>
          </>
        )}
      </Gauge.Plot>
      <Gauge.Legend />
    </Gauge>
  );
}
