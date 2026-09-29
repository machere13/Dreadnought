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
  title: 'Alert',
  eyebrow: 'FEEDBACK / 01',
  description: 'Постоянное сообщение внутри страницы: информация, успех, предупреждение или ошибка с необязательным действием и закрытием.',
  readyCode: `import { Alert, Button } from '@dreadnought/ui/react';

<Alert type="error" variant="filled" title="Не удалось получить ответ"
  description="Попробуйте ещё раз." showIcon
  action={<Button onClick={retry}>Повторить</Button>} />`,
  adapterCode: `import { AlertAdapter } from '@dreadnought/react/unstyled';

<AlertAdapter type="warning" title="Внимание" className={styles.myAlert} closable />`,
  adapterDescription: 'Адаптер сохраняет семантику, структуру и локальное закрытие, но не подключает тему и стандартные иконки.',
  apiRows: [
    ['type', 'info | success | warning | error', 'info', 'Смысл сообщения и роль для скринридера'],
    ['variant', 'outlined | filled', 'outlined', 'Оформление готового сообщения'],
    ['title', 'ReactNode', '—', 'Заголовок сообщения'],
    ['description', 'ReactNode', '—', 'Текст сообщения'],
    ['action', 'ReactNode', '—', 'Дополнительное действие'],
    ['showIcon', 'boolean', 'false', 'Показывает значок типа сообщения'],
    ['icon', 'ReactNode', '—', 'Свой значок при showIcon'],
    ['closable', 'boolean | { closeIcon?, onClose?, aria-label? }', 'false', 'Кнопка локального закрытия'],
    ['slotClassNames', '{ icon?, title?, description?, actions?, close? }', '—', 'Классы отдельных частей сообщения'],
  ],
  footnote: <>Нужен хотя бы <code>title</code> или <code>description</code>. Warning и error имеют роль <code>alert</code>, info и success — <code>status</code>. Закрытое сообщение можно показать снова только повторно смонтировав компонент.</>,
  demo: <AlertDemo />,
};
