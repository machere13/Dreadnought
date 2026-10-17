import { Card } from '@dreadnought/ui/react';

export function CardAppearanceDemo() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card title="Обычная карточка" variant="outlined">
        <p>Стандартные отступы и рамка.</p>
      </Card>
      <Card title="Компактная карточка" size="compact">
        <p>Уменьшенные отступы для плотных интерфейсов.</p>
      </Card>
      <Card variant="borderless">
        <strong>Без шапки и рамки</strong>
        <p>Нет title или extra — нет шапки. borderless убирает рамку, но сохраняет поверхность.</p>
      </Card>
    </div>
  );
}
