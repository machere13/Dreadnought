import { CandlestickChart } from '@dreadnought/ui/react';

const data = [
  { id: 'a', label: 'День 1', open: 105, close: 110, low: 100, high: 115 },
  { id: 'b', label: 'День 2', open: 110, close: 118, low: 106, high: 125 },
  { id: 'c', label: 'День 3', open: 118, close: 114, low: 108, high: 122 },
];
const domain = [80, 140] as const;
export function CandlestickChartScaleDemo() {
  return (
    <CandlestickChart
      label="Фиксированная шкала"
      data={data}
      domain={domain}
      description="Диапазон 80–140 можно использовать в нескольких графиках для сравнения. Все минимумы и максимумы должны в него помещаться."
    />
  );
}
