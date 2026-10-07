import { useState } from 'react';
import { Switch } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function SwitchDemo() {
  const [checked, setChecked] = useState(false);
  return <div className={styles.demoRow}>
    <Switch checked={checked} onChange={event => setChecked(event.currentTarget.checked)}>Получать уведомления</Switch>
    <Switch defaultChecked>Автосохранение</Switch>
    <Switch disabled>Недоступная настройка</Switch>
  </div>;
}

export const switchDoc: ComponentDoc = {
  ...getCatalogDoc('switch'),
  title: 'Switch',
  description: 'Переключатель для включения и выключения настройки. Два состояния, без анимации.',
  adapterDescription: 'Адаптер использует общее поведение getCheckableState и нативный input с ролью switch. Оформление подключает только готовый компонент.',
  footnote: 'Space переключает значение. onChange получает событие поля; новое состояние — event.currentTarget.checked. name, value, form и reset работают как у checkbox. ref указывает на input.',
  demo: <SwitchDemo />,
};
