import { Icon } from '@dreadnought/ui/react';
import type { IconProps } from '@dreadnought/ui/react';

const names: readonly IconProps['name'][] = [
  'code',
  'link',
  'menu',
  'search',
  'table',
  'close',
  'copy',
  'filter',
  'bold',
  'check',
  'left',
  'right',
  'undo',
  'redo',
  'warning',
  'italic',
  'strikethrough',
  'quote',
  'heading',
  'image',
  'ellipsis',
  'calendar',
  'clock',
  'columns',
  'code-block',
  'eye',
  'eye-off',
  'down',
  'info-circle',
  'check-circle',
  'close-circle',
  'unordered-list',
  'ordered-list',
];

export function IconNamesDemo() {
  return (
    <ul
      aria-label="Набор иконок"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 10rem), 1fr))',
        gap: 16,
        listStyle: 'none',
        padding: 0,
      }}
    >
      {names.map((name) => (
        <li key={name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Icon name={name} />
          <code>{name}</code>
        </li>
      ))}
    </ul>
  );
}
