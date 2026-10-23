import { Sankey } from '@dreadnought/ui/react';

const nodes = [
  { id: 'search', label: 'Поиск' },
  { id: 'email', label: 'Рассылка' },
  { id: 'site', label: 'Сайт' },
  { id: 'order', label: 'Заказ' },
  { id: 'exit', label: 'Без заказа' },
];
const links = [
  { id: 'search-site', source: 'search', target: 'site', value: 70 },
  { id: 'email-site', source: 'email', target: 'site', value: 30 },
  { id: 'site-order', source: 'site', target: 'order', value: 60 },
  { id: 'site-exit', source: 'site', target: 'exit', value: 40 },
];
export function SankeyBasicDemo() {
  return (
    <Sankey
      label="От источника к результату"
      description="100 посетителей: 70 из поиска и 30 из рассылки. 60 сделали заказ."
      nodes={nodes}
      links={links}
      formatValue={(value) => `${value} чел.`}
    />
  );
}
