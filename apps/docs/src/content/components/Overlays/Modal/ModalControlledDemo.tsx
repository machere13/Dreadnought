import { useState } from 'react';
import { Button, Modal } from '@dreadnought/ui/react';

export function ModalControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Modal
          title="Управляемое окно"
          open={open}
          onOpenChange={setOpen}
          closable={false}
          closeOnBackdrop={false}
          closeOnEscape={false}
          content={<p>В этом примере окно закрывается только кнопкой «Завершить».</p>}
          footer={({ close }) => <Button onClick={close}>Завершить</Button>}
        >
          {(trigger) => <Button {...trigger}>Открыть управляемое окно</Button>}
        </Modal>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Открыть окно извне
        </Button>
      </div>
      <span role="status">Окно {open ? 'открыто' : 'закрыто'}</span>
    </div>
  );
}
