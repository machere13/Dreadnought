import { Button, Input, Modal } from '@dreadnought/ui/react';

const policies = ['eager', 'lazy', 'unmount'] as const;

export function ModalMountDemo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {policies.map((policy) => (
        <Modal
          key={policy}
          title={`Режим ${policy}`}
          mountPolicy={policy}
          content={<Input aria-label={`Черновик ${policy}`} placeholder="Введите черновик" />}
          footer={({ close }) => <Button onClick={close}>Закрыть пример</Button>}
        >
          {(trigger) => <Button {...trigger}>Открыть {policy}</Button>}
        </Modal>
      ))}
    </div>
  );
}
