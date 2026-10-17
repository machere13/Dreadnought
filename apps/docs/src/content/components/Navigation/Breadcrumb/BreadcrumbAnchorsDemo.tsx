import { useId } from 'react';
import { Breadcrumb } from '@dreadnought/ui/react';

export function BreadcrumbAnchorsDemo() {
  const id = useId();
  const overviewId = `${id}-overview`;
  const sectionsId = `${id}-sections`;
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <Breadcrumb
        aria-label="Путь по разделам примера"
        items={[
          { label: 'Обзор проекта', href: `#${overviewId}` },
          { label: 'Разделы проекта', href: `#${sectionsId}` },
          { label: 'Текущий пример' },
        ]}
      />
      <section id={overviewId}>
        <h4>Обзор проекта</h4>
        <p>Назначение и возможности проекта.</p>
      </section>
      <section id={sectionsId}>
        <h4>Разделы проекта</h4>
        <p>Ссылки в пути ведут к этим разделам на той же странице.</p>
      </section>
    </div>
  );
}
