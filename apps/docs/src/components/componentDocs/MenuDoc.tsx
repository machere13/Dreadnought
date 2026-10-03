import { useState } from 'react';
import { Menu } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function MenuDemo() {
  const [action, setAction] = useState('');
  return <div className={styles.demo}>
    <Menu aria-label="Действия примера" items={[
      { value: 'copy', label: 'Копировать' },
      { value: 'edit', label: 'Редактировать' },
      { value: 'delete', label: 'Удалить', disabled: true },
    ]} onAction={setAction} />
    <p role="status">{action ? `Действие: ${action}` : 'Выберите действие'}</p>
  </div>;
}

export const menuDoc: ComponentDoc = {
  ...getCatalogDoc('menu'),
  title: 'Menu',
  description: 'Переиспользуемый список действий или выбора. Используется в меню скрытых вкладок Tabs; сам не открывает всплывающее окно.',
  adapterDescription: 'MenuAdapter задаёт разметку, выбор и клавиатурную навигацию без оформления.',
  footnote: <>Стрелки вверх/вниз и Home/End перемещают фокус, пропуская отключённые пункты. Открытие, закрытие и позиционирование задаёт владелец меню.</>,
  demo: <MenuDemo />,
};
