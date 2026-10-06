import { createRef } from 'react';
import { BarChartAdapter, type BarChartAdapterProps } from '../../../src/unstyled.ts';
const props: BarChartAdapterProps = { label: 'Столбцы', categories: [], series: [], domain: [-10, 100],
  slotProps: { bar: () => ({ ref: createRef<SVGGElement>() }), tooltipMark: item => ({ title: item.id }) } };
<BarChartAdapter {...props} />;
// @ts-expect-error dimensions must be a pair
<BarChartAdapter {...props} width={500} />;
// @ts-expect-error geometry cannot be replaced through slots
<BarChartAdapter {...props} slotProps={{ bar: () => ({ children: 'replace' }) }} />;
// @ts-expect-error children cannot replace semantic data
<BarChartAdapter {...props}>content</BarChartAdapter>;
