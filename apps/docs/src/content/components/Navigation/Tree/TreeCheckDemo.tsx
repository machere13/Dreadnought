import { useState } from 'react';
import { Checkbox, Tree } from '@dreadnought/ui/react';

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

export function TreeCheckDemo() {
  const [strict, setStrict] = useState(false);
  const [checked, setChecked] = useState<string[]>(['start']);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Checkbox checked={strict} onChange={(event) => setStrict(event.currentTarget.checked)}>
        Независимые отметки
      </Checkbox>
      <Tree
        records={records}
        getKey={(node) => node.id}
        getChildren={(node) => node.children}
        getLabel={(node) => node.label}
        checkable
        checkStrictly={strict}
        checkedKeys={checked}
        onCheckedKeysChange={setChecked}
        defaultExpandedKeys={['docs']}
        aria-label="Отметки разделов"
      />
      <p role="status">Отмечены: {checked.map((key) => labels[key]).join(', ') || 'ничего'}</p>
    </div>
  );
}
