import { useState } from 'react';
import { Badge, Button, Mark } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

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
  title: 'Badge',
  eyebrow: 'DATA DISPLAY / 02',
  description: 'Короткая метка или счётчик поверх другого элемента. Поддерживает маркер, иконку и три варианта оформления.',
  readyCode: `import { Badge, Button, Mark } from '@dreadnought/ui/react';

<Badge appearance="ghosted" icon={<Mark shape="circle" />}>Новый</Badge>
<Badge target={<Button aria-label="Уведомления, 2 новых">Уведомления</Button>}>2</Badge>`,
  adapterCode: `import { BadgeAdapter } from '@dreadnought/react/unstyled';

<BadgeAdapter className={styles.myBadge} icon={<span aria-hidden="true">●</span>}>Новый</BadgeAdapter>`,
  adapterDescription: 'Адаптер собирает метку и расположение иконки без оформления. Отдельной логики в core для Badge нет.',
  apiRows: [
    ['appearance', 'solid | outline | ghosted', 'solid', 'Оформление готовой метки'],
    ['children', 'ReactNode', '—', 'Содержимое метки'],
    ['icon', 'ReactNode', '—', 'Маркер или иконка рядом с текстом'],
    ['iconPosition', 'start | end', 'start', 'Положение маркера или иконки'],
    ['target', 'ReactElement', '—', 'Элемент, поверх которого размещается счётчик'],
  ],
  footnote: <>Метка поверх <code>target</code> скрыта от скринридера. Включайте значение счётчика в доступное имя самого целевого элемента.</>,
  demo: <BadgeDemo />,
};
