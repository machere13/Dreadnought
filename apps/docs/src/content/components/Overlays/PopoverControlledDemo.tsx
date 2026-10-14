import { useState } from 'react';
import { Button, Popover } from '@dreadnought/ui/react';

export function PopoverControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Popover
          aria-label="Управляемая панель"
          open={open}
          onOpenChange={setOpen}
          content={({ close }) => (
            <div style={{ display: 'grid', gap: 12 }}>
              <p>Состоянием открытия управляет приложение.</p>
              <Button onClick={close}>Закрыть панель</Button>
            </div>
          )}
        >
          {(trigger) => <Button {...trigger}>Управляемая панель</Button>}
        </Popover>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Открыть извне
        </Button>
      </div>
      <span role="status">Панель {open ? 'открыта' : 'закрыта'}</span>
    </div>
  );
}
