import { Badge } from '@dreadnought/ui/react';

export function BadgeAppearanceDemo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Badge appearance="solid">Solid</Badge>
      <Badge appearance="outline">Outline</Badge>
      <Badge appearance="ghosted">Ghosted</Badge>
    </div>
  );
}
