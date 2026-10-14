import { useId, useState } from 'react';
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

export function TreeSelectUnknownDemo() {
  const id = useId();
  const [value, setValue] = useState<string | null>('archived');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p id={id}>Сохранённая команда</p>
      <TreeSelect<Team, string>
        records={records}
        getKey={(team) => team.id}
        getChildren={(team) => team.children}
        getLabel={(team) => team.label}
        defaultExpandedKeys={['dev']}
        value={value}
        onValueChange={setValue}
        aria-labelledby={id}
        placeholder="Выберите команду"
      />
      <p role="status">Сохранённый ключ: {value ?? 'нет'}</p>
    </div>
  );
}
