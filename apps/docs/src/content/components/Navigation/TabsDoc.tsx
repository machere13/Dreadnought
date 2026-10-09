import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import { Input, Tabs } from '@dreadnought/ui/react';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

function TabsDemo() {
  return (
    <div className={styles.demo}>
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
    </div>
  );
}

function TabsLifecycleDemo() {
  const policies = ['eager', 'lazy', 'unmount'] as const;
  return (
    <div className={styles.demo}>
      <h3>Состояние содержимого</h3>
      <p>Введите текст, переключите вкладку и вернитесь. В unmount поле сбросится.</p>
      <Tabs defaultValue="eager">
        <Tabs.List aria-label="Режим содержимого">
          {policies.map((policy) => (
            <Tabs.Tab key={policy} value={policy}>
              {policy}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {policies.map((policy) => (
          <Tabs.Panel key={policy} value={policy} mountPolicy={policy}>
            <Input aria-label={`Текст ${policy}`} placeholder="Введите текст" />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

export const tabsDoc: ComponentDoc = {
  ...getCatalogDoc('tabs'),
  title: 'Tabs',
  description:
    'Переключение разделов с клавиатурной навигацией, прокруткой и меню скрытых вкладок при переполнении.',
  adapterDescription:
    'Составной адаптер сохраняет связи вкладок и панелей, управление фокусом и клавиатурой, но не подключает тему.',
  logicDescription:
    'Хук управляет выбранным значением; при собственной разметке семантику и клавиатурное поведение нужно реализовать самостоятельно.',
  footnote: (
    <>
      Для каждого <code>Tabs.Tab</code> нужна одна <code>Tabs.Panel</code> с тем же значением. Дайте{' '}
      <code>Tabs.List</code> доступное имя. Стрелки, Home и End переключают доступные вкладки.{' '}
      <code>mountPolicy</code> панели: <code>eager</code> создаёт содержимое сразу,{' '}
      <code>lazy</code> — при первом открытии и сохраняет, <code>unmount</code> — удаляет при
      закрытии. По умолчанию <code>eager</code>; оболочка остаётся во всех режимах. При unmount
      очищаются эффекты и локальное состояние, но внешнее состояние сохраняется. Сохранение
      содержимого не приостанавливает эффекты. Меню переполнения настраивается через{' '}
      <code>moreLabel</code> и <code>slotProps</code> списка.
    </>
  ),
  demo: (
    <>
      <TabsDemo />
      <TabsLifecycleDemo />
    </>
  ),
};

export function TabsPage() {
  return <ComponentPage component="tabs" doc={tabsDoc} />;
}
