import { Badge, Mark } from '@dreadnought/ui/react';

export function MarkStatusDemo() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge appearance="ghosted" icon={<Mark color="var(--dreadnought-color-status-success)" />}>
        Готово
      </Badge>
      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <Mark shape="square" color="#e5ad5b" />В очереди
      </span>
    </div>
  );
}
