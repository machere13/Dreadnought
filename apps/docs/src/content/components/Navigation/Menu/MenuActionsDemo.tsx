import { useState } from 'react';
import { Menu } from '@dreadnought/ui/react';

const items = [
  { value: 'copy', label: 'Копировать' },
  {
    value: 'export',
    label: 'Экспорт',
    children: [
      { value: 'pdf', label: 'PDF' },
      { value: 'csv', label: 'CSV' },
    ],
  },
  { value: 'delete', label: 'Удалить', disabled: true },
];

export function MenuActionsDemo() {
  const [action, setAction] = useState('');
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: '20rem' }}>
      <Menu aria-label="Действия примера" items={items} onAction={setAction} />
      <p role="status">{action ? `Действие: ${action}` : 'Выберите действие'}</p>
    </div>
  );
}
