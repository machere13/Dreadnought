import { Mark } from '@dreadnought/ui/react';

export function MarkShapesDemo() {
  return (
    <ul
      aria-label="Формы маркера"
      style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}
    >
      <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Mark shape="circle" />
        <span>circle — цвет темы</span>
      </li>
      <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Mark shape="square" color="var(--dreadnought-color-status-success)" />
        <span>square — зелёный цвет статуса</span>
      </li>
    </ul>
  );
}
