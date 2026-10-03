import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import { Tabs } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function TabsDemo() {
  return <div className={styles.demo}>
    <Tabs defaultValue="ready">
      <Tabs.List aria-label="Уровень библиотеки">
        <Tabs.Tab value="ready">Компонент</Tabs.Tab>
        <Tabs.Tab value="adapter">Адаптер</Tabs.Tab>
        <Tabs.Tab value="logic">Логика</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="ready">Готовый компонент с темой.</Tabs.Panel>
      <Tabs.Panel value="adapter">Разметка и поведение без готовых стилей.</Tabs.Panel>
      <Tabs.Panel value="logic">Состояние и функции для своего компонента.</Tabs.Panel>
    </Tabs>
  </div>;
}

export const tabsDoc: ComponentDoc = {
  ...getCatalogDoc('tabs'),
  title: 'Tabs',
  description: 'Переключение разделов с клавиатурной навигацией, прокруткой и меню скрытых вкладок при переполнении.',
  adapterDescription: 'Составной адаптер сохраняет связи вкладок и панелей, управление фокусом и клавиатурой, но не подключает тему.',
  logicDescription: 'Хук управляет выбранным значением; при собственной разметке семантику и клавиатурное поведение нужно реализовать самостоятельно.',
  footnote: <>Для каждого <code>Tabs.Tab</code> нужна одна <code>Tabs.Panel</code> с тем же значением. Дайте <code>Tabs.List</code> доступное имя. Стрелки, Home и End переключают доступные вкладки и делают их видимыми; скрытые панели остаются в DOM. Если вкладки не помещаются, список прокручивается и появляется меню «ещё». Его имя задаёт <code>moreLabel</code>, части оформления — <code>slotProps</code> у списка.</>,
  demo: <TabsDemo />,
};
