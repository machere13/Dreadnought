import { createRef } from 'react';
import { BarChartAdapter, type BarChartAdapterProps } from '../../../src/unstyled.ts';
const props: BarChartAdapterProps = {
  label: 'Столбцы',
  categories: [],
  series: [],
  domain: [-10, 100],
  slotProps: {
    bar: () => ({ ref: createRef<SVGGElement>() }),
    tooltipMark: (item) => ({ title: item.id }),
  },
};
<BarChartAdapter {...props} />;
<BarChartAdapter
  {...props}
  minCategorySize={80}
  pageSize={20}
  slotProps={{ scrollContainer: { ref: createRef<HTMLDivElement>() } }}
/>;
// @ts-expect-error pagination state cannot be overridden through native slots
<BarChartAdapter {...props} slotProps={{ paginationButton: { disabled: false } }} />;
// @ts-expect-error dimensions must be a pair
<BarChartAdapter {...props} width={500} />;
// @ts-expect-error geometry cannot be replaced through slots
<BarChartAdapter {...props} slotProps={{ bar: () => ({ children: 'replace' }) }} />;
<BarChartAdapter {...props}>
  <BarChartAdapter.Legend>
    {({ series, visible }) => `${series.label}: ${visible}`}
  </BarChartAdapter.Legend>
  <BarChartAdapter.Plot
    tooltipContent={({ bar, defaultContent }) => (bar.value > 0 ? defaultContent : null)}
  >
    {({ bar, defaultContent }) =>
      bar.value === 0 ? (
        defaultContent
      ) : (
        <rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} />
      )
    }
  </BarChartAdapter.Plot>
  <BarChartAdapter.Table />
  <BarChartAdapter.Pagination />
</BarChartAdapter>;
