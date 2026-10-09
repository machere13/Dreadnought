import { useState } from 'react';
import { Menu } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function MenuDemo() {
  const [action, setAction] = useState('');
  return <div className={styles.demo}>
    <Menu aria-label="Действия примера" items={[
      { value: 'copy', label: 'Копировать' },
      { value: 'export', label: 'Экспорт', children: [{ value: 'pdf', label: 'PDF' }, { value: 'csv', label: 'CSV' }] },
      { value: 'delete', label: 'Удалить', disabled: true },
    ]} onAction={setAction} />
    <p role="status">{action ? `Действие: ${action}` : 'Выберите действие'}</p>
  </div>;
}

export const menuDoc: ComponentDoc = {
  ...getCatalogDoc('menu'),
  title: 'Menu',
  description: 'Действия, группы, разделители и вложенные пункты с раскрытием внутри меню. mode="navigation" создаёт навигацию с настоящими ссылками. Menu используется также в Tabs и Dropdown.',
  adapterDescription: 'MenuAdapter задаёт разметку, выбор и клавиатурную навигацию без оформления.',
  logicDescription: <>getVisibleMenuRows рассчитывает видимость групп, подменю и наследование disabled. getTreeKeyAction, getNextEnabledValue и getTypeaheadValue задают клавиатурные правила без React и DOM.</>,
  footnote: <>Стрелки вверх/вниз и Home/End перемещают фокус; вправо раскрывает подменю и входит в него, влево закрывает его или возвращает к родителю. Набор букв ищет среди видимых доступных пунктов. Группы и разделители не участвуют в фокусе. openKeys управляет раскрытием, defaultOpenKeys задаёт начальное состояние; onOpenKeysChange сообщает запрос. onAction вызывается только у конечного пункта. В режиме navigation ссылки получают href и aria-current="page", Tab проходит по ним обычным способом. Раскрытие сейчас только внутри меню: боковых всплывающих подменю и горизонтального режима пока нет.</>,
  demo: <MenuDemo />,
};
