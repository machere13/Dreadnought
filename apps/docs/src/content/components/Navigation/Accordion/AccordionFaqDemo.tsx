import { Accordion } from '@dreadnought/ui/react';

export function AccordionFaqDemo() {
  return (
    <Accordion>
      <Accordion.Item value="connect">
        <Accordion.Trigger>Как подключить компонент?</Accordion.Trigger>
        <Accordion.Panel>Импортируйте готовый компонент из @dreadnought/ui/react.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="theme">
        <Accordion.Trigger>Как изменить оформление?</Accordion.Trigger>
        <Accordion.Panel>Задайте значения публичных токенов темы.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
