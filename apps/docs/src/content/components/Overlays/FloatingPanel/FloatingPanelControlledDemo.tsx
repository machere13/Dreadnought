import { useState } from 'react';
import { Button, FloatingPanel } from '@dreadnought/ui/react';

const placements = ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const;
const labels = ['Снизу справа', 'Снизу слева', 'Сверху справа', 'Сверху слева'];

export function FloatingPanelControlledDemo() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<(typeof placements)[number]>('top-left');
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <label>
        Положение панели{' '}
        <select
          value={placement}
          onChange={(event) => {
            const next = placements.find((value) => value === event.target.value);
            if (next) setPlacement(next);
          }}
        >
          {placements.map((value, index) => (
            <option key={value} value={value}>
              {labels[index]}
            </option>
          ))}
        </select>
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Button size="compact" onClick={() => setOpen(true)}>
          Открыть извне
        </Button>
        <Button size="compact" variant="secondary" disabled={!open} onClick={() => setOpen(false)}>
          Закрыть извне
        </Button>
      </div>
      <FloatingPanel
        title="Вспомогательная панель"
        open={open}
        onOpenChange={setOpen}
        placement={placement}
        rootStyle={placement.startsWith('bottom') ? { bottom: 160 } : { top: 80 }}
        content={
          <p>Панель не блокирует страницу. Измените её положение или закройте кнопкой в примере.</p>
        }
      >
        {(trigger) => <Button {...trigger}>Вспомогательная панель</Button>}
      </FloatingPanel>
    </div>
  );
}
