import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from '@dreadnought/ui/react';

const meta = {
  title: 'Navigation/Accordion',
  component: Accordion,
  args: { children: null },
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FAQ: Story = {
  render: () => <Accordion>
    <Accordion.Item value="install">
      <Accordion.Trigger>Как установить библиотеку?</Accordion.Trigger>
      <Accordion.Panel>Установите нужные пакеты и импортируйте готовый компонент.</Accordion.Panel>
    </Accordion.Item>
    <Accordion.Item value="theme">
      <Accordion.Trigger>Как изменить тему?</Accordion.Trigger>
      <Accordion.Panel>Переопределите глобальные и компонентные токены темы.</Accordion.Panel>
    </Accordion.Item>
  </Accordion>,
};

export const Multiple: Story = {
  render: () => <Accordion multiple defaultValue={['core']}>
    <Accordion.Item value="core">
      <Accordion.Trigger>Первый слой — core</Accordion.Trigger>
      <Accordion.Panel>Поведение и чистая логика без фреймворка.</Accordion.Panel>
    </Accordion.Item>
    <Accordion.Item value="adapter">
      <Accordion.Trigger>Второй слой — адаптер</Accordion.Trigger>
      <Accordion.Panel>Разметка, состояние и доступность.</Accordion.Panel>
    </Accordion.Item>
  </Accordion>,
};

export const Disabled: Story = {
  render: () => <Accordion>
    <Accordion.Item value="ready">
      <Accordion.Trigger>Доступный вопрос</Accordion.Trigger>
      <Accordion.Panel>Ответ можно открыть.</Accordion.Panel>
    </Accordion.Item>
    <Accordion.Item value="unavailable">
      <Accordion.Trigger disabled>Недоступный вопрос</Accordion.Trigger>
      <Accordion.Panel>Этот ответ пока недоступен.</Accordion.Panel>
    </Accordion.Item>
  </Accordion>,
};
