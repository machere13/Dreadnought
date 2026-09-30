import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import { useState } from 'react';
import { Alert, Button } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function AlertDemo() {
  const [attempts, setAttempts] = useState(0);

  return <div className={`${styles.demo} ${styles.alertDemo}`}>
    <Alert type="info" title="Полезная подсказка" description="Это сообщение можно закрыть." showIcon closable={{ 'aria-label': 'Закрыть подсказку' }} />
    <Alert type="error" variant="filled" title="Не удалось получить ответ" description={`Попыток: ${attempts}`} showIcon
      action={<Button size="compact" onClick={() => setAttempts((count) => count + 1)}>Повторить</Button>} />
  </div>;
}

export const alertDoc: ComponentDoc = {
  ...getCatalogDoc('alert'),
  title: 'Alert',
  description: 'Постоянное сообщение внутри страницы: информация, успех, предупреждение или ошибка с необязательным действием и закрытием.',
  adapterDescription: 'Адаптер сохраняет семантику, структуру и локальное закрытие, но не подключает тему и стандартные иконки.',
  footnote: <>Нужен хотя бы <code>title</code> или <code>description</code>. Warning и error имеют роль <code>alert</code>, info и success — <code>status</code>. Закрытое сообщение можно показать снова только повторно смонтировав компонент.</>,
  demo: <AlertDemo />,
};
