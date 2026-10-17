import { useState } from 'react';
import { Button, Dropdown } from '@dreadnought/ui/react';

const items = [{ value: 'confirm', label: 'Подтвердить' }];

export function DropdownPlacementDemo() {
  const [chosen, setChosen] = useState('');
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Dropdown
          items={items}
          placement="topRight"
          arrow
          onAction={() => setChosen('Сверху справа')}
        >
          {(trigger) => <Button {...trigger}>Сверху справа</Button>}
        </Dropdown>
        <Dropdown
          items={items}
          placement="bottomLeft"
          arrow
          onAction={() => setChosen('Снизу слева')}
        >
          {(trigger) => <Button {...trigger}>Снизу слева</Button>}
        </Dropdown>
      </div>
      <span role="status">{chosen ? `Подтверждено: ${chosen}` : 'Откройте любое меню'}</span>
    </div>
  );
}
