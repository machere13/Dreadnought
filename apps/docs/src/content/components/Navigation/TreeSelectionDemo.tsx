import { useState } from 'react';
import { Tree } from '@dreadnought/ui/react';

type Node = { id: string; label: string; children?: readonly Node[] };
const records: readonly Node[] = [
  {
    id: 'docs',
    label: 'Документация',
    children: [
      { id: 'start', label: 'Начало' },
      { id: 'components', label: 'Компоненты', children: [{ id: 'button', label: 'Button' }] },
    ],
  },
];
const labels: Record<string, string> = {
  docs: 'Документация',
  start: 'Начало',
  components: 'Компоненты',
  button: 'Button',
};

export function TreeSelectionDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div>
      <Tree
        records={records}
        getKey={(node) => node.id}
        getChildren={(node) => node.children}
        getLabel={(node) => node.label}
        selectable
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        defaultExpandedKeys={['docs']}
        aria-label="Разделы документации"
      />
      <p role="status">
        Выбран раздел: {selected.map((key) => labels[key]).join(', ') || 'не выбран'}
      </p>
    </div>
  );
}
