import { Button, Tooltip } from '@dreadnought/ui/react';

export function TooltipBasicDemo() {
  return (
    <Tooltip content="Открывает настройки приложения">
      {(trigger) => <Button {...trigger}>Настройки</Button>}
    </Tooltip>
  );
}
