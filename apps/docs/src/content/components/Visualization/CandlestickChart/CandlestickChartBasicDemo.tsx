import { CandlestickChart } from '@dreadnought/ui/react';

const data = [
  { id: 'mon', label: 'Пн', open: 100, close: 110, low: 96, high: 114 },
  { id: 'tue', label: 'Вт', open: 110, close: 103, low: 99, high: 117 },
  { id: 'wed', label: 'Ср', open: 103, close: 103, low: 98, high: 108 },
  { id: 'thu', label: 'Чт', open: 103, close: 115, low: 101, high: 119 },
  { id: 'fri', label: 'Пт', open: 115, close: 112, low: 109, high: 120 },
];
export function CandlestickChartBasicDemo() {
  return (
    <CandlestickChart
      label="Котировки за неделю"
      data={data}
      description="Полая свеча — рост, заполненная — падение. В среду открытие равно закрытию: тело показано линией."
      formatValue={(value) => value.toFixed(2)}
    />
  );
}
