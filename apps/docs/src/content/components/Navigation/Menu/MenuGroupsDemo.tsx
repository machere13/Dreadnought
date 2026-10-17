import { useState } from 'react';
import { Menu } from '@dreadnought/ui/react';

const items = [
  {
    value: 'document',
    type: 'group',
    label: 'Документ',
    children: [
      { value: 'save', label: 'Сохранить' },
      { value: 'rename', label: 'Переименовать' },
    ],
  },
  { value: 'divider', type: 'divider' },
  {
    value: 'settings',
    type: 'group',
    label: 'Настройки',
    children: [
      { value: 'preferences', label: 'Параметры' },
      { value: 'permissions', label: 'Права доступа', disabled: true },
    ],
  },
] as const;

export function MenuGroupsDemo() {
  const [action, setAction] = useState('');
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: '20rem' }}>
      <Menu
        aria-label="Сгруппированные действия"
        items={items}
        selectedValue={action}
        onAction={setAction}
      />
      <p role="status">{action ? `Действие: ${action}` : 'Выберите действие'}</p>
    </div>
  );
}
