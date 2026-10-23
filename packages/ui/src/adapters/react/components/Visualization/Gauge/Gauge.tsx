import { GaugeAdapter, type GaugeAdapterProps } from '@dreadnought/react/unstyled';
import { gaugePresentation as appearance } from '#presentation/Visualization/Gauge/index.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';

export type GaugeProps = GaugeAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');

export function Gauge({ className, slotProps = {}, ...props }: GaugeProps) {
  return (
    <GaugeAdapter
      {...props}
      className={classes(appearance.root, className)}
      slotProps={{
        ...slotProps,
        plot: { ...slotProps.plot, className: classes(appearance.plot, slotProps.plot?.className) },
        segment: (segment) => {
          const slot = slotProps.segment?.(segment);
          return { ...slot, className: classes(appearance.segment, slot?.className) };
        },
        legend: {
          ...slotProps.legend,
          className: classes(appearance.legend, slotProps.legend?.className),
        },
        band: (segment) => {
          const slot = slotProps.band?.(segment);
          return { ...slot, className: classes(appearance.band, slot?.className) };
        },
        mark: (segment) => {
          const slot = slotProps.mark?.(segment);
          return {
            ...slot,
            className: classes(markPresentation.root, appearance.mark, slot?.className),
          };
        },
        tooltip: {
          ...slotProps.tooltip,
          className: classes(
            tooltipPresentation.root,
            appearance.tooltip,
            slotProps.tooltip?.className,
          ),
        },
        tooltipTable: {
          ...slotProps.tooltipTable,
          className: classes(appearance.tooltipTable, slotProps.tooltipTable?.className),
        },
      }}
    />
  );
}
