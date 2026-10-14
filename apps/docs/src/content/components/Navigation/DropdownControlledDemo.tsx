import { useState } from 'react';
import { Button, Dropdown } from '@dreadnought/ui/react';

const items = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
];

export function DropdownControlledDemo() {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState('pdf');
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Dropdown
          items={items}
          open={open}
          onOpenChange={setOpen}
          selectedValue={format}
          onAction={setFormat}
        >
          {(trigger) => <Button {...trigger}>Формат экспорта</Button>}
        </Dropdown>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Открыть извне
        </Button>
      </div>
      <span role="status">
        Формат: {format.toUpperCase()}. Меню {open ? 'открыто' : 'закрыто'}.
      </span>
    </div>
  );
}
