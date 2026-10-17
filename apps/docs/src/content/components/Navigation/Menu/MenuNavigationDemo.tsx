import { useId, useState } from 'react';
import { Menu } from '@dreadnought/ui/react';

export function MenuNavigationDemo() {
  const id = useId();
  const [selected, setSelected] = useState('overview');
  const items = [
    { value: 'overview', label: 'Описание примера', href: `#${id}-overview` },
    { value: 'usage', label: 'Использование примера', href: `#${id}-usage` },
  ];
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Menu
        mode="navigation"
        aria-label="Навигация примера"
        items={items}
        selectedValue={selected}
        onAction={setSelected}
      />
      <section id={`${id}-overview`}>
        <h4>Описание примера</h4>
        <p>Пункты меню ведут к разделам на этой странице.</p>
      </section>
      <section id={`${id}-usage`}>
        <h4>Использование примера</h4>
        <p>Выберите ссылку: адрес получит якорь, а текущий пункт — aria-current="page".</p>
      </section>
    </div>
  );
}
