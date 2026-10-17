import { Breadcrumb } from '@dreadnought/ui/react';

export function BreadcrumbBasicDemo() {
  return (
    <Breadcrumb
      aria-label="Пример пути"
      items={[{ label: 'Главная', href: '/' }, { label: 'Компоненты' }, { label: 'Button' }]}
    />
  );
}
