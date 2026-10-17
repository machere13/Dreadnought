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

export function TreeSelectDemo() {
  const id = useId();
  const [value, setValue] = useState<string | null>(null);
  const selected = records
    .flatMap((team) => [team, ...(team.children ?? [])])
    .find((team) => team.id === value);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p id={id}>Команда</p>
      <TreeSelect<Team, string>
        records={records}
        getKey={(team) => team.id}
        getChildren={(team) => team.children}
        getLabel={(team) => team.label}
        defaultExpandedKeys={['dev']}
        aria-labelledby={id}
        placeholder="Выберите команду"
        value={value}
        onValueChange={setValue}
      />
      <p role="status">
        {selected ? `Команда: ${selected.label} (${value})` : 'Команда не выбрана'}
      </p>
    </div>
  );
}
