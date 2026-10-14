import { useState } from 'react';
import { Button, Drawer } from '@dreadnought/ui/react';

export function DrawerControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Drawer
          aria-label="Управляемая панель Drawer"
          open={open}
          onOpenChange={setOpen}
          content={({ close }) => (
            <div style={{ display: 'grid', gap: 16 }}>
              <h3>Управляемая панель</h3>
              <p>Открытие и закрытие подтверждает приложение через open.</p>
              <Button onClick={close}>Закрыть панель</Button>
            </div>
          )}
        >
          {(trigger) => <Button {...trigger}>Открыть управляемую панель</Button>}
        </Drawer>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Открыть Drawer извне
        </Button>
      </div>
      <span role="status">Панель {open ? 'открыта' : 'закрыта'}</span>
    </div>
  );
}
