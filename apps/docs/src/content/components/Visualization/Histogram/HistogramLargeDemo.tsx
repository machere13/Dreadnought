import { Histogram } from '@dreadnought/ui/react';

const measurements = Array.from(
  { length: 100000 },
  (_, index) => ((index * 17) % 101) + ((index * 31) % 101),
);

export function HistogramLargeDemo() {
  return (
    <Histogram
      label="100 000 измерений — 20 интервалов"
      data={measurements}
      bins={20}
      domain={[0, 200]}
      pageSize={5}
      categoryLabel="Значение"
      valueLabel="Измерения"
    />
  );
}
