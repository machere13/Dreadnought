import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import { useState } from 'react';
import { Button, Card } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function CardDemo() {
  const [expanded, setExpanded] = useState(false);

  return <div className={styles.demo}>
    <Card className={styles.demoCard}>
      <h3>Композиция без лишних ограничений</h3>
      <p>Карточка объединяет содержимое и действия.</p>
      <Button size="compact" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Скрыть' : 'Подробнее'}</Button>
      {expanded && <p>В карточку можно вложить любые компоненты.</p>}
    </Card>
  </div>;
}

export const cardDoc: ComponentDoc = {
  ...getCatalogDoc('card'),
  title: 'Card',
  description: 'Оформленный контейнер для произвольного содержимого: текста, элементов управления и вложенных компонентов.',
  adapterDescription: 'Адаптер даёт контейнер без темы. Card не требует отдельной логики или состояния в core.',
  footnote: <>Поддерживаются стандартные свойства <code>&lt;div&gt;</code>. Если карточка целиком выполняет действие, используйте подходящий интерактивный элемент внутри.</>,
  demo: <CardDemo />,
};
