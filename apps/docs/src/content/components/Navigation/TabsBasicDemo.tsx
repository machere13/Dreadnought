import { useState } from 'react';
import { Tabs } from '@dreadnought/ui/react';

export function TabsBasicDemo() {
  const [value, setValue] = useState('ready');
  return (
    <Tabs value={value} onValueChange={setValue}>
      <Tabs.List aria-label="Уровень библиотеки">
        <Tabs.Tab value="ready">Компонент</Tabs.Tab>
        <Tabs.Tab value="adapter">Адаптер</Tabs.Tab>
        <Tabs.Tab value="logic">Логика</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="ready">Готовый компонент с темой.</Tabs.Panel>
      <Tabs.Panel value="adapter">Разметка и поведение без готовых стилей.</Tabs.Panel>
      <Tabs.Panel value="logic">Состояние и функции для своего компонента.</Tabs.Panel>
    </Tabs>
  );
}
