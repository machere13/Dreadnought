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

export function TreeSelectSearchDemo() {
  const id = useId();
  const [search, setSearch] = useState('');
  const [value, setValue] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p id={id}>Поиск команды</p>
      <TreeSelect<Team, string>
        records={records}
        getKey={(team) => team.id}
        getChildren={(team) => team.children}
        getLabel={(team) => team.label}
        defaultExpandedKeys={['dev']}
        aria-labelledby={id}
        showSearch={{ searchValue: search, onSearch: setSearch }}
        value={value}
        onValueChange={setValue}
        placeholder="Найдите команду"
        emptyContent="Команды не найдены"
      />
      <p>Текст поиска: {search || 'пусто'}</p>
      <p role="status">Выбранный ключ: {value ?? 'нет'}</p>
    </div>
  );
}
