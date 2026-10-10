import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import { useState } from 'react';
import { Button, Card } from '@dreadnought/ui/react';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

function CardDemo() {
  const [expanded, setExpanded] = useState(false);
  const [updated, setUpdated] = useState(false);

  return (
    <div className={`${styles.demo} ${styles.demoStack}`}>
      <Card
        className={styles.demoCard}
        title="Композиция без лишних ограничений"
        extra={
          <Button size="compact" variant="ghosted" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Скрыть' : 'Подробнее'}
          </Button>
        }
      >
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
      <Card
        className={styles.demoCard}
        title="Карточка проекта"
        cover={<img src="/markdown-upload-demo.svg" alt="Обложка проекта Dreadnought" />}
        footer={updated ? 'Только что обновлено' : 'Обновлено сегодня'}
        actions={[
          <Button key="open" size="compact" variant="ghosted" onClick={() => setUpdated(true)}>
            Обновить
          </Button>,
          <Button key="docs" size="compact" variant="ghosted" href="/getting-started/">
            Документация
          </Button>,
        ]}
      >
        <p>Обложка, содержимое, подвал и действия — отдельные зоны одной карточки.</p>
      </Card>
    </div>
  );
}

export const cardDoc: ComponentDoc = {
  ...getCatalogDoc('card'),
  title: 'Card',
  description:
    'Оформленный контейнер для произвольного содержимого: текста, элементов управления и вложенных компонентов.',
  adapterDescription:
    'Адаптер даёт контейнер без темы. Card не требует отдельной логики или состояния в core.',
  footnote: (
    <>
      Без <code>title/extra</code> шапка не создаётся. <code>cover</code> расположен сверху,{' '}
      <code>footer</code> — под содержимым, <code>actions</code> — последним рядом. Для действий
      используйте кнопки или ссылки со стабильными <code>key</code>. Карточка сама не является
      кнопкой. Без дополнительных зон разметка содержимого не меняется.
    </>
  ),
  demo: <CardDemo />,
};

export function CardPage() {
  return <ComponentPage component="card" doc={cardDoc} />;
}
