import { CandlestickChart } from '@dreadnought/ui/react';

const data = Array.from({ length: 10000 }, (_, index) => {
  const open = 100 + (index % 100) * 0.25;
  const close = open + ((index % 7) - 3) * 0.2;
  return {
    id: `period-${index}`,
    label: `Период ${index + 1}`,
    open,
    close,
    low: Math.min(open, close) - 0.4,
    high: Math.max(open, close) + 0.6,
  };
});
export function CandlestickChartManyDemo() {
  return (
    <CandlestickChart
      label="Длинный ряд: 10 000 периодов"
      data={data}
      pageSize={20}
      description="20 свечей и 20 строк таблицы на странице. Введите 500, чтобы перейти к последним периодам; шкала останется общей."
      formatValue={(value) => value.toFixed(2)}
    />
  );
}
