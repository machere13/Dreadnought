import { useState } from 'react';
import { useToolbarItem } from '@dreadnought/react/logic';
import { Button, Toolbar } from '@dreadnought/ui/react';

function ZoomButton({
  value,
  children,
  disabled,
  onClick,
}: {
  value: string;
  children: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({ value, disabled });
  return (
    <Button
      {...itemProps}
      type="button"
      size="compact"
      variant="secondary"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function ToolbarVerticalDemo() {
  const [zoom, setZoom] = useState(100);
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Toolbar orientation="vertical" loop={false} aria-label="Масштаб текста">
        <ZoomButton
          value="increase"
          disabled={zoom >= 150}
          onClick={() => setZoom((value) => Math.min(150, value + 25))}
        >
          Увеличить
        </ZoomButton>
        <ZoomButton
          value="decrease"
          disabled={zoom <= 75}
          onClick={() => setZoom((value) => Math.max(75, value - 25))}
        >
          Уменьшить
        </ZoomButton>
        <ZoomButton value="reset" onClick={() => setZoom(100)}>
          Сбросить масштаб
        </ZoomButton>
      </Toolbar>
      <div>
        <p style={{ fontSize: `${zoom}%` }}>Образец текста</p>
        <p role="status">Масштаб: {zoom}%</p>
      </div>
    </div>
  );
}
