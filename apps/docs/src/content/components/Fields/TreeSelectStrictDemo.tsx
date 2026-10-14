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

export function TreeSelectStrictDemo() {
  const id = useId();
  const [value, setValue] = useState<string[]>([]);
  const selected = records
    .flatMap((team) => [team, ...(team.children ?? [])])
    .filter((team) => value.includes(team.id));
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p id={id}>Независимый выбор</p>
      <TreeSelect<Team, string>
        records={records}
        getKey={(team) => team.id}
        getChildren={(team) => team.children}
        getLabel={(team) => team.label}
        defaultExpandedKeys={['dev']}
        multiple
        checkStrictly
        showSearch
        value={value}
        onValueChange={setValue}
        aria-labelledby={id}
        placeholder="Выберите команды"
      />
      <p role="status">
        Команды: {selected.length ? selected.map((team) => team.label).join(', ') : 'не выбраны'}.
        Ключи: <code>{JSON.stringify(value)}</code>
      </p>
    </div>
  );
}
