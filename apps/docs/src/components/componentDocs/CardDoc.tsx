import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import { useState } from 'react';
import { Button, Card } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function CardDemo() {
  const [expanded, setExpanded] = useState(false);

  return <div className={`${styles.demo} ${styles.demoStack}`}>
    <Card className={styles.demoCard} title="Композиция без лишних ограничений"
      extra={<Button size="compact" variant="ghosted"
        onClick={() => setExpanded(value => !value)}>{expanded ? 'Скрыть' : 'Подробнее'}</Button>}>
      <p>Карточка объединяет содержимое и действия.</p>
      {expanded && <p>В карточку можно вложить любые компоненты.</p>}
    </Card>
    <Card className={styles.demoCard} title="Компактная карточка" size="compact">
      <p>Уменьшенные отступы для плотных интерфейсов.</p>
    </Card>
    <Card className={styles.demoCard} variant="borderless">
      <strong>Без шапки и рамки</strong>
      <p>Произвольное содержимое с тем же тёмным фоном.</p>
    </Card>
  </div>;
}

export const cardDoc: ComponentDoc = {
  ...getCatalogDoc('card'),
  title: 'Card',
  description: 'Оформленный контейнер для произвольного содержимого: текста, элементов управления и вложенных компонентов.',
  adapterDescription: 'Адаптер даёт контейнер без темы. Card не требует отдельной логики или состояния в core.',
  footnote: <>Без <code>title/extra</code> шапка не создаётся. Карточка сама не является кнопкой: действия задавайте кнопкой или ссылкой внутри.</>,
  demo: <CardDemo />,
};
