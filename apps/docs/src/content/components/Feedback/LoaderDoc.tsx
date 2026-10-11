import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { useState } from 'react';
import { Button, Card, Loader } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

function LoaderDemo() {
  const [loading, setLoading] = useState(false);
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <div className={styles.demoRow}><Button onClick={() => setLoading(value => !value)}>{loading ? 'Завершить загрузку' : 'Начать загрузку'}</Button></div>
    <Loader loading={loading} delay={200} label="Загрузка данных" showLabel>
      <Card title="Данные проекта"><p>Содержимое остаётся на месте во время загрузки.</p><Button size="compact" variant="secondary">Открыть проект</Button></Card>
    </Loader>
  </div>;
}

export const loaderDoc: ComponentDoc = {
  ...getCatalogDoc('loader'), title: 'Loader',
  description: 'Индикатор ожидания: отдельно или поверх содержимого, которое остаётся смонтированным.',
  adapterDescription: 'Адаптер задаёт aria-busy, доступное имя индикатора и inert для вложенного содержимого, без темы и готового кольца.',
  demo: <LoaderDemo />,
  footnote: <>
    <code>delay={200}</code> откладывает индикатор на 200 мс, но блокирует контент сразу.
    Быстрые запросы не показывают индикатор; <code>delay={0}</code> показывает сразу.
    При <code>loading=false</code> индикатор исчезает и содержимое снова доступно.
    Размеры: <code>small / default / large</code>; своя графика — <code>indicator</code>.
  </>,
};

export function LoaderPage() {
  return <ComponentPage component="loader" doc={loaderDoc} />;
}
