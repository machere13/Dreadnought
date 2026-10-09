import { useState } from 'react';
import { Button } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import styles from '../../../shared/Documentation.module.css';

function ButtonDemo() {
  const [count, setCount] = useState(0);

  return <div className={styles.demo}>
    <div className={styles.demoRow}>
      <Button onClick={() => setCount((value) => value + 1)}>Нажать</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="ghosted">Ghosted</Button>
    </div>
    <p className={styles.demoResult} aria-live="polite">Нажатий: {count}</p>
  </div>;
}

const buttonDoc: ComponentDoc = {
  ...getCatalogDoc('button'),
    title: 'Button',
    description: 'Действие или ссылка с готовыми состояниями, доступной семантикой и оформлением, которое можно заменить без изменения поведения.',
    adapterDescription: 'Адаптер создаёт нативный элемент и управляет его состояниями, но не подключает тему.',
    logicDescription: <>Хук возвращает свойства для собственного нативного <code>&lt;button&gt;</code>.</>,
    footnote: <>Поддерживаются также стандартные свойства <code>&lt;button&gt;</code> и <code>&lt;a&gt;</code>. Для кнопки только с иконкой задайте доступное имя через <code>aria-label</code>.</>,
    demo: <ButtonDemo />,
  };

export function ButtonPage() {
  return <ComponentPage component="button" doc={buttonDoc} />;
}
