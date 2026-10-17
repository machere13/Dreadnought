import { TreeSelect } from '@dreadnought/ui/react';

type Team = { id: string; label: string; children?: readonly Team[] };
const records: readonly Team[] = [
  {
    id: 'dev',
    label: 'Разработка',
    children: [
      { id: 'front', label: 'Frontend' },
      { id: 'back', label: 'Backend' },
    ],
  },
  { id: 'design', label: 'Дизайн' },
];

const treeProps = {
  records,
  getKey: (team: Team) => team.id,
  getChildren: (team: Team) => team.children,
  getLabel: (team: Team) => team.label,
  defaultExpandedKeys: ['dev'],
};

export function TreeSelectStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <p>Недоступный выбор</p>
        <TreeSelect {...treeProps} disabled defaultValue="front" aria-label="Недоступный выбор" />
      </div>
      <div>
        <p>Только просмотр</p>
        <TreeSelect {...treeProps} readOnly defaultValue="front" aria-label="Только просмотр" />
      </div>
      <div>
        <p>Нет доступных команд</p>
        <TreeSelect
          {...treeProps}
          getDisabled={() => true}
          aria-label="Нет доступных команд"
          placeholder="Все узлы недоступны"
        />
      </div>
    </div>
  );
}
