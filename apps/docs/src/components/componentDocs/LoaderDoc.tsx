import { useState } from 'react';
import { Button, Card, Loader } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function LoaderDemo() {
  const [loading, setLoading] = useState(false);
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <div className={styles.demoRow}><Button onClick={() => setLoading(value => !value)}>{loading ? 'Завершить загрузку' : 'Начать загрузку'}</Button></div>
    <Loader loading={loading} label="Загрузка данных" showLabel>
      <Card title="Данные проекта"><p>Содержимое остаётся на месте во время загрузки.</p><Button size="compact" variant="secondary">Открыть проект</Button></Card>
    </Loader>
  </div>;
}

export const loaderDoc: ComponentDoc = {
  ...getCatalogDoc('loader'), title: 'Loader',
  description: 'Индикатор ожидания: отдельно или поверх содержимого, которое остаётся смонтированным.',
  adapterDescription: 'Адаптер задаёт aria-busy, доступное имя индикатора и inert для вложенного содержимого, без темы и готового кольца.',
  demo: <LoaderDemo />,
  footnote: <>При <code>loading=false</code> содержимое снова доступно. Размеры: <code>small / default / large</code>. Свою графику передавайте в <code>indicator</code>. Loader не показывает числовой прогресс. Прелоадер приложения — этот же компонент в полноэкранном контейнере.</>,
};
