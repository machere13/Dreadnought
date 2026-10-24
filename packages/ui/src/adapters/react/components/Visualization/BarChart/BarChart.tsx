import { BarChartAdapter, type BarChartAdapterProps } from '@dreadnought/react/unstyled';
import { getBarChartAppearance } from './getBarChartAppearance.ts';

export type BarChartProps = BarChartAdapterProps;
function BarChartRoot({ className, slotProps, ...props }: BarChartProps) {
  return <BarChartAdapter {...props} {...getBarChartAppearance(className, slotProps)} />;
}

export const BarChart: typeof BarChartRoot &
  Pick<typeof BarChartAdapter, 'Plot' | 'Legend' | 'Table' | 'Pagination' | 'Empty'> =
  Object.assign(BarChartRoot, {
    Plot: BarChartAdapter.Plot,
    Legend: BarChartAdapter.Legend,
    Table: BarChartAdapter.Table,
    Pagination: BarChartAdapter.Pagination,
    Empty: BarChartAdapter.Empty,
  });
