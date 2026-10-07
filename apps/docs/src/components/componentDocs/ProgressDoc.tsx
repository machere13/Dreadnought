import { useState } from 'react';
import { Button, Progress } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function ProgressDemo() {
  const [value, setValue] = useState(35);
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <Progress value={value} aria-label="Загрузка файла" />
    <div className={styles.demoRow}>
      <Button size="compact" variant="secondary" onClick={() => setValue(value => Math.max(0, value - 10))}>Уменьшить</Button>
      <Button size="compact" variant="secondary" onClick={() => setValue(value => Math.min(100, value + 10))}>Увеличить</Button>
    </div>
    <Progress value={100} status="success" aria-label="Загрузка завершена" />
    <Progress value={65} status="error" aria-label="Ошибка загрузки" />
  </div>;
}

export const progressDoc: ComponentDoc = {
  ...getCatalogDoc('progress'), title: 'Progress',
  description: 'Показывает, какая часть работы выполнена. В отличие от Loader, требует известного общего объёма.',
  adapterDescription: 'Адаптер использует числовой core, задаёт доступную разметку и точную ширину заполнения, без темы и визуальных состояний.',
  logicDescription: <>Core ограничивает значение диапазоном и возвращает процент и ARIA. Завершение означает достижение max, а не успешность операции.</>,
  demo: <ProgressDemo />,
  footnote: <>Подпись округляется: 3 из 8 отображается как 38%, но заполнение остаётся 37.5%. Скрывайте подпись через <code>showPercent=false</code>. Успех и ошибка задаются явно через <code>status</code>; 100% остаётся обычным состоянием. Доступное имя операции передавайте через <code>aria-label</code> или <code>aria-labelledby</code>.</>,
};
