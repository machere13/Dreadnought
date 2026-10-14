import { Button, Popover } from '@dreadnought/ui/react';

export function PopoverPlacementDemo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Popover
        aria-label="Сверху справа"
        placement="topRight"
        arrow
        content="Панель предпочитает положение сверху справа."
      >
        {(trigger) => <Button {...trigger}>Сверху справа</Button>}
      </Popover>
      <Popover
        aria-label="Без стрелки"
        placement="right"
        arrow={false}
        content="Панель может содержать и обычный текст."
      >
        {(trigger) => <Button {...trigger}>Без стрелки</Button>}
      </Popover>
    </div>
  );
}
