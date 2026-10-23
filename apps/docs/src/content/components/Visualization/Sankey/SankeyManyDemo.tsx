import { Sankey } from '@dreadnought/ui/react';

const teams = Array.from({ length: 12 }, (_, index) => ({
  id: `team-${index}`,
  label: `Команда ${index + 1}`,
}));
const nodes = [{ id: 'budget', label: 'Общий бюджет' }, ...teams];
const links = teams.map((team, index) => ({
  id: team.id,
  source: 'budget',
  target: team.id,
  value: 10 + index * 5,
}));
export function SankeyManyDemo() {
  return (
    <Sankey
      label="Бюджет команд"
      nodes={nodes}
      links={links}
      pageSize={4}
      description="12 связей на диаграмме, по четыре строки в таблице. Переключение страницы не меняет потоки."
    />
  );
}
