import type { BoxPlotGroup } from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { BoxPlotSlotProps } from './boxPlot.types.ts';

export function BoxPlotGlyph({
  group,
  slotProps,
}: {
  group: BoxPlotGroup;
  slotProps: BoxPlotSlotProps;
}) {
  const positions = group.positions!;
  const x = (value: number) => `${2 + value * 96}%`;
  const lower = x(positions.lowerWhisker);
  const upper = x(positions.upperWhisker);
  return (
    <svg width="100%" height="64" aria-hidden="true">
      <g {...native(slotProps.whisker)} fill="none" stroke="currentColor">
        <line x1={lower} x2={upper} y1={32} y2={32} />
        <line x1={lower} x2={lower} y1={20} y2={44} />
        <line x1={upper} x2={upper} y1={20} y2={44} />
      </g>
      <rect
        {...native(slotProps.box)}
        x={x(positions.q1)}
        y={16}
        width={`${(positions.q3 - positions.q1) * 96}%`}
        height={32}
        fill="currentColor"
        fillOpacity={0.2}
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
      />
      <line
        {...native(slotProps.median)}
        x1={x(positions.median)}
        x2={x(positions.median)}
        y1={16}
        y2={48}
        stroke="currentColor"
        strokeWidth={3}
        vectorEffect="non-scaling-stroke"
      />
      {group.outliers.map((item) => (
        <circle
          key={item.value}
          {...native(slotProps.outlier)}
          cx={x(item.position)}
          cy={32}
          r={4}
          fill="none"
          stroke="currentColor"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
