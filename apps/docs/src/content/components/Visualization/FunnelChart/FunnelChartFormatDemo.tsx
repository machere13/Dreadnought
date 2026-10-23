import { FunnelChart } from '@dreadnought/ui/react';

const data = [
  { id: 'invite', label: 'Приглашены на обучение', value: 120 },
  { id: 'start', label: 'Начали курс', value: 90 },
  { id: 'finish', label: 'Завершили курс', value: 54 },
];
const percent = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 1 });

export function FunnelChartFormatDemo() {
  return (
    <FunnelChart
      label="Завершение курса"
      data={data}
      formatValue={(value) => `${value} чел.`}
      formatPercent={(ratio) => percent.format(ratio)}
      labels={{ value: 'Участники', drop: 'Не продолжили' }}
    />
  );
}
