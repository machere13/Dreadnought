import { Button, Drawer } from '@dreadnought/ui/react';

const panels = [
  { placement: 'right', label: 'Справа', size: 360 },
  { placement: 'left', label: 'Слева', size: 400 },
  { placement: 'top', label: 'Сверху', size: '35vh' },
  { placement: 'bottom', label: 'Снизу', size: 320 },
] as const;

export function DrawerPlacementDemo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {panels.map(({ placement, label, size }) => (
        <Drawer
          key={placement}
          placement={placement}
          size={size}
          aria-label={`Панель: ${label}`}
          content={({ close }) => (
            <div style={{ display: 'grid', gap: 16 }}>
              <h3>{label}</h3>
              <p>
                Размер панели: {size}
                {typeof size === 'number' ? ' px' : ''}.
              </p>
              <Button onClick={close}>Закрыть панель</Button>
            </div>
          )}
        >
          {(trigger) => <Button {...trigger}>{label}</Button>}
        </Drawer>
      ))}
    </div>
  );
}
