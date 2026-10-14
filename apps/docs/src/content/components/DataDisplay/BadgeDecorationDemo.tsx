import { Badge, Icon, Mark } from '@dreadnought/ui/react';

export function BadgeDecorationDemo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Badge>Без маркера</Badge>
      <Badge icon={<Mark color="var(--dreadnought-color-status-success)" />}>В сети</Badge>
      <Badge appearance="ghosted" icon={<Icon name="check" />} iconPosition="end">
        Готово
      </Badge>
    </div>
  );
}
