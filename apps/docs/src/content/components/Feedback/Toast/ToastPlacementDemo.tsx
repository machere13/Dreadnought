import { useState } from 'react';
import { Button, Toast, ToastViewport } from '@dreadnought/ui/react';

const positions = [
  { placement: 'top-start', label: 'Сверху слева' },
  { placement: 'top', label: 'Сверху по центру' },
  { placement: 'top-end', label: 'Сверху справа' },
  { placement: 'bottom-start', label: 'Снизу слева' },
  { placement: 'bottom', label: 'Снизу по центру' },
  { placement: 'bottom-end', label: 'Снизу справа' },
] as const;

export function ToastPlacementDemo() {
  const [position, setPosition] = useState<(typeof positions)[number]>(positions[5]);
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {positions.map((option) => (
        <Button
          key={option.placement}
          variant="secondary"
          onClick={() => {
            setPosition(option);
            setOpen(true);
          }}
        >
          {option.label}
        </Button>
      ))}
      <ToastViewport placement={position.placement} aria-label="Положения уведомлений">
        <Toast
          open={open}
          onOpenChange={setOpen}
          title={`Положение: ${position.label}`}
          duration={3000}
          closeLabel="Закрыть пример положения"
        />
      </ToastViewport>
    </div>
  );
}
