import { Button, Tooltip } from '@dreadnought/ui/react';

export function TooltipPlacementDemo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Tooltip content="Подсказка сверху" placement="top">
        {(trigger) => <Button {...trigger}>Сверху</Button>}
      </Tooltip>
      <Tooltip content="Подсказка справа" placement="right">
        {(trigger) => <Button {...trigger}>Справа</Button>}
      </Tooltip>
      <Tooltip content="Подсказка без стрелки" arrow={false}>
        {(trigger) => <Button {...trigger}>Без стрелки</Button>}
      </Tooltip>
    </div>
  );
}
