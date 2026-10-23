import { Sankey } from '@dreadnought/ui/react';

const nodes = [
  { id: 'income', label: 'Поступления' },
  { id: 'account', label: 'Счёт' },
  { id: 'rent', label: 'Аренда' },
  { id: 'salary', label: 'Зарплаты' },
];
const links = [
  { id: 'in', source: 'income', target: 'account', value: 100 },
  { id: 'rent', source: 'account', target: 'rent', value: 25 },
  { id: 'salary', source: 'account', target: 'salary', value: 50 },
];
export function SankeyBalanceDemo() {
  return (
    <Sankey
      label="Распределение поступлений"
      description="На счёт пришло 100 тыс. ₽, ушло 75 тыс. ₽. Остаток 25 тыс. ₽ не является отдельным потоком."
      nodes={nodes}
      links={links}
      formatValue={(value) => `${value} тыс. ₽`}
    />
  );
}
