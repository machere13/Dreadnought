import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import { useState } from 'react';
import { Badge, Button, Mark } from '@dreadnought/ui/react';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

function BadgeDemo() {
  const [count, setCount] = useState(2);

  return <div className={styles.demo}>
    <div className={styles.demoRow}>
      <Badge appearance="solid" icon={<Mark shape="circle" />}>Solid</Badge>
      <Badge appearance="outline">Outline</Badge>
      <Badge appearance="ghosted">Ghosted</Badge>
      <Badge target={<Button variant="secondary" aria-label={`Уведомления, ${count} новых`} onClick={() => setCount((value) => value + 1)}>Уведомления</Button>}>{count}</Badge>
    </div>
  </div>;
}

export const badgeDoc: ComponentDoc = {
  ...getCatalogDoc('badge'),
  title: 'Badge',
  description: 'Короткая метка или счётчик поверх другого элемента. Поддерживает маркер, иконку и три варианта оформления.',
  adapterDescription: 'Адаптер собирает метку и расположение иконки без оформления. Отдельной логики в core для Badge нет.',
  footnote: <>Метка поверх <code>target</code> скрыта от скринридера. Включайте значение счётчика в доступное имя самого целевого элемента.</>,
  demo: <BadgeDemo />,
};

export function BadgePage() {
  return <ComponentPage component="badge" doc={badgeDoc} />;
}
