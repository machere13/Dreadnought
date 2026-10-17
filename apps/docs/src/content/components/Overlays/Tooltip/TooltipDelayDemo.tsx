import { Button, Tooltip } from '@dreadnought/ui/react';

export function TooltipDelayDemo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Tooltip
        content="Появляется через 500 мс, скрывается через 300 мс"
        openDelay={500}
        closeDelay={300}
      >
        {(trigger) => <Button {...trigger}>С задержкой</Button>}
      </Tooltip>
      <Tooltip content="Появляется и скрывается мгновенно" openDelay={0} closeDelay={0}>
        {(trigger) => <Button {...trigger}>Без задержки</Button>}
      </Tooltip>
    </div>
  );
}
