import { Tabs } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function TabsDemo() {
  return <div className={styles.demo}>
    <Tabs defaultValue="ready">
      <Tabs.List aria-label="Уровень библиотеки" className={styles.tabsDemoList}>
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
  title: 'Tabs',
  eyebrow: 'NAVIGATION / 01',
  description: 'Переключение разделов с клавиатурной навигацией, доступными вкладками и сохранением состояния скрытых панелей.',
  readyCode: `import { Tabs } from '@dreadnought/ui/react';

<Tabs defaultValue="ready">
  <Tabs.List aria-label="Уровень библиотеки">
    <Tabs.Tab value="ready">Компонент</Tabs.Tab>
    <Tabs.Tab value="adapter">Адаптер</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="ready">Готовый компонент с темой.</Tabs.Panel>
  <Tabs.Panel value="adapter">Разметка без готовых стилей.</Tabs.Panel>
</Tabs>`,
  adapterCode: `import { TabsAdapter } from '@dreadnought/react/unstyled';

<TabsAdapter defaultValue="first" className={styles.myTabs}>
  <TabsAdapter.List aria-label="Разделы">
    <TabsAdapter.Tab value="first">Первый</TabsAdapter.Tab>
  </TabsAdapter.List>
  <TabsAdapter.Panel value="first">Содержимое</TabsAdapter.Panel>
</TabsAdapter>`,
  logicCode: `import { useTabs } from '@dreadnought/react/logic';

const { value, setValue } = useTabs({ defaultValue: 'first' });
return <button onClick={() => setValue('second')} aria-pressed={value === 'second'}>Второй</button>;`,
  adapterDescription: 'Составной адаптер сохраняет связи вкладок и панелей, управление фокусом и клавиатурой, но не подключает тему.',
  logicDescription: 'Хук управляет выбранным значением; при собственной разметке семантику и клавиатурное поведение нужно реализовать самостоятельно.',
  apiRows: [
    ['defaultValue', 'string', '—', 'Начальная вкладка в неуправляемом режиме'],
    ['value', 'string', '—', 'Текущая вкладка в управляемом режиме'],
    ['onValueChange', '(value: string) => void', '—', 'Уведомление о смене вкладки'],
    ['Tabs.Tab value', 'string', '—', 'Уникальное значение вкладки'],
    ['Tabs.Tab disabled', 'boolean', 'false', 'Исключает вкладку из навигации'],
    ['Tabs.Panel value', 'string', '—', 'Связывает панель с вкладкой'],
  ],
  footnote: <>Для каждого <code>Tabs.Tab</code> нужна одна <code>Tabs.Panel</code> с тем же значением. Дайте <code>Tabs.List</code> доступное имя. Стрелки, Home и End переключают доступные вкладки; скрытые панели остаются в DOM.</>,
  demo: <TabsDemo />,
};
