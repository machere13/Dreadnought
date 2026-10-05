import { createRef } from 'react';
import { LineChartAdapter, type LineChartAdapterProps } from '../../../src/unstyled.ts';
const props: LineChartAdapterProps = { label: 'Линии', series: [], xDomain: [0, 10], yDomain: [0, 100],
  slotProps: { point: () => ({ ref: createRef<SVGCircleElement>() }), tooltipMark: item => ({ title: item.id }) } };
<LineChartAdapter {...props} />;
// @ts-expect-error dimensions must be a pair
<LineChartAdapter {...props} width={500} />;
// @ts-expect-error geometry is owned by the adapter
<LineChartAdapter {...props} slotProps={{ series: () => ({ points: '0,0' }) }} />;
// @ts-expect-error children cannot replace semantic data
<LineChartAdapter {...props}>content</LineChartAdapter>;
