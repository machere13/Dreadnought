import { useState } from 'react';
import { Button, Dropdown } from '@dreadnought/ui/react';

const items = [
  { value: 'edit', label: 'Редактировать' },
  { value: 'download', label: 'Скачать' },
  { value: 'delete', label: 'Удалить', disabled: true },
];

export function DropdownActionsDemo() {
  const [chosen, setChosen] = useState('');
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Dropdown
        items={items}
        onAction={(value) => setChosen(items.find((item) => item.value === value)?.label ?? '')}
      >
        {(trigger) => <Button {...trigger}>Действия с файлом</Button>}
      </Dropdown>
      <span role="status">{chosen ? `Выбрано: ${chosen}` : 'Выберите действие'}</span>
    </div>
  );
}
