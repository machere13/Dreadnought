import { Loader } from '@dreadnought/ui/react';

const sizes = ['small', 'default', 'large'] as const;

export function LoaderSizesDemo() {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      {sizes.map((size) => (
        <Loader key={size} size={size} label={`Загрузка: ${size}`} showLabel />
      ))}
    </div>
  );
}
