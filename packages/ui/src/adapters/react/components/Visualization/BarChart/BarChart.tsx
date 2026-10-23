import { BarChartAdapter, type BarChartAdapterProps } from '@dreadnought/react/unstyled';
import { getBarChartAppearance } from './getBarChartAppearance.ts';

export type BarChartProps = BarChartAdapterProps;
export function BarChart({ className, slotProps, ...props }: BarChartProps) {
  return <BarChartAdapter {...props} {...getBarChartAppearance(className, slotProps)} />;
}
