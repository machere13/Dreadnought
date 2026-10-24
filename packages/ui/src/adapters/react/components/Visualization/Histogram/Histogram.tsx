import { HistogramAdapter, type HistogramAdapterProps } from '@dreadnought/react/unstyled';
import { getBarChartAppearance } from '../BarChart/getBarChartAppearance.ts';
import { histogramPresentation } from '#presentation/Visualization/Histogram/index.ts';

export type HistogramProps = HistogramAdapterProps;
function HistogramRoot({ className, slotProps = {}, ...props }: HistogramProps) {
  const appearance = getBarChartAppearance(
    [histogramPresentation.root, className].filter(Boolean).join(' '),
    {
      ...slotProps,
      table: {
        ...slotProps.table,
        className: [histogramPresentation.table, slotProps.table?.className]
          .filter(Boolean)
          .join(' '),
      },
    },
  );
  return <HistogramAdapter {...props} {...appearance} />;
}

export const Histogram: typeof HistogramRoot &
  Pick<typeof HistogramAdapter, 'Plot' | 'Table' | 'Pagination' | 'Empty'> = Object.assign(
  HistogramRoot,
  {
    Plot: HistogramAdapter.Plot,
    Table: HistogramAdapter.Table,
    Pagination: HistogramAdapter.Pagination,
    Empty: HistogramAdapter.Empty,
  },
);
