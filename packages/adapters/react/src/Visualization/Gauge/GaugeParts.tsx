import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { useGauge } from './GaugeContext.tsx';
import { GaugePlot } from './GaugePlot.tsx';
import type { GaugeLegendProps, GaugePlotProps } from './gauge.types.ts';

export function GaugePlotAdapter(props: GaugePlotProps) {
  return <GaugePlot {...useGauge()} {...props} />;
}
export function GaugeLegendAdapter({ children }: GaugeLegendProps) {
  const { layout, active, labels, formatValue, slotProps } = useGauge();
  return layout.segments.length ? (
    <ul {...native(slotProps.legend, ['role', 'aria-label'])} aria-label={labels.thresholds}>
      {layout.segments.map((segment) => {
        const content = (
          <>
            <MarkAdapter {...native(slotProps.mark?.(segment))} shape="circle" />
            <span>{segment.label}</span>
            <span>
              {formatValue(segment.from)} — {formatValue(segment.to)}
            </span>
          </>
        );
        return (
          <li
            {...native(slotProps.band?.(segment), ['aria-current'])}
            key={segment.id}
            data-color={segment.index % 6}
            aria-current={segment.id === active?.id ? 'true' : undefined}
          >
            {children
              ? children({
                  segment,
                  active: segment.id === active?.id,
                  formatValue,
                  defaultContent: content,
                })
              : content}
          </li>
        );
      })}
    </ul>
  ) : null;
}
