import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Tabs } from '@dreadnought/ui/react';
import styles from './Tabs.stories.module.css';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  args: { defaultValue: 'ready', children: null },
  argTypes: {
    defaultValue: { control: 'select', options: ['ready', 'adapter', 'core'] },
    children: { table: { disable: true } },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Layers: Story = {
  render: (args) => <Tabs key={args.defaultValue} {...args}>
    <Tabs.List aria-label="Уровень библиотеки">
      <Tabs.Tab value="ready">Компонент</Tabs.Tab>
      <Tabs.Tab value="adapter">Адаптер</Tabs.Tab>
      <Tabs.Tab value="core">Логика</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="ready">Готовый компонент с темой.</Tabs.Panel>
    <Tabs.Panel value="adapter">Структура без оформления.</Tabs.Panel>
    <Tabs.Panel value="core">Правила выбора и навигации.</Tabs.Panel>
  </Tabs>,
};

export const Disabled: Story = {
  args: { defaultValue: 'first' },
  argTypes: { defaultValue: { control: 'select', options: ['first', 'third'] } },
  render: (args) => <Tabs key={args.defaultValue} {...args}>
    <Tabs.List aria-label="Разделы">
      <Tabs.Tab value="first">Доступен</Tabs.Tab>
      <Tabs.Tab value="second" disabled>Недоступен</Tabs.Tab>
      <Tabs.Tab value="third">Следующий</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="first">Первый раздел.</Tabs.Panel>
    <Tabs.Panel value="second">Недоступный раздел.</Tabs.Panel>
    <Tabs.Panel value="third">Третий раздел.</Tabs.Panel>
  </Tabs>,
};

function ControlledExample() {
  const [value, setValue] = useState('first');
  return <Tabs value={value} onValueChange={setValue}>
    <Tabs.List aria-label="Управляемые вкладки">
      <Tabs.Tab value="first">Первый</Tabs.Tab>
      <Tabs.Tab value="second">Второй</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="first">Текущее значение: {value}</Tabs.Panel>
    <Tabs.Panel value="second">Текущее значение: {value}</Tabs.Panel>
  </Tabs>;
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledExample />,
};

function OverflowExample() {
  const [value, setValue] = useState('0');
  const [narrow, setNarrow] = useState(true);
  const [labels, setLabels] = useState(['Обзор проекта', 'Недоступный раздел', 'Компоненты библиотеки',
    'Настройка темы', 'Примеры использования', 'История изменений']);
  return <div className={styles.example}>
    <div className={styles.controls}>
      <Button variant="outlined" size="compact" onClick={() => setNarrow(!narrow)}>
        {narrow ? 'Расширить' : 'Сузить'}
      </Button>
      <Button variant="outlined" size="compact" onClick={() => setLabels([...labels, `Раздел ${labels.length + 1}`])}>
        Добавить вкладку
      </Button>
      <Button variant="outlined" size="compact" disabled={labels.length <= 3} onClick={() => {
        if (value === String(labels.length - 1)) setValue('0');
        setLabels(labels.slice(0, -1));
      }}>Убрать последнюю</Button>
    </div>
    <div className={narrow ? styles.narrow : styles.wide}>
      <Tabs value={value} onValueChange={setValue}>
        <Tabs.List aria-label="Разделы проекта">
          {labels.map((label, index) => <Tabs.Tab key={index} value={String(index)} disabled={index === 1}>{label}</Tabs.Tab>)}
        </Tabs.List>
        {labels.map((label, index) => <Tabs.Panel key={index} value={String(index)}>{label}</Tabs.Panel>)}
      </Tabs>
    </div>
  </div>;
}

export const Overflow: Story = {
  parameters: { controls: { disable: true } },
  render: () => <OverflowExample />,
};
