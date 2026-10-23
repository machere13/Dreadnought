import { Treemap } from '@dreadnought/ui/react';

const data = {
  id: 'all',
  label: 'Все команды',
  children: ['Север', 'Юг'].map((label, group) => ({
    id: `group-${group}`,
    label,
    children: Array.from({ length: 50 }, (_, index) => ({
      id: `${group}-${index}`,
      label: `Проект ${group * 50 + index + 1}`,
      value: 100 - index,
    })),
  })),
};

export function TreemapManyDemo() {
  return <Treemap label="100 проектов в двух командах" data={data} pageSize={10} />;
}
