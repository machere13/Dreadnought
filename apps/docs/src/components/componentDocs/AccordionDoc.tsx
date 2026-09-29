import { Accordion } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function AccordionDemo() {
  return <div className={styles.demo}>
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
  </div>;
}

export const accordionDoc: ComponentDoc = {
  title: 'Accordion',
  eyebrow: 'NAVIGATION / 02',
  description: 'Раскрывающиеся разделы для FAQ и пояснений. Поддерживает один или несколько открытых пунктов.',
  readyCode: `import { Accordion } from '@dreadnought/ui/react';

<Accordion>
  <Accordion.Item value="install">
    <Accordion.Trigger>Как установить?</Accordion.Trigger>
    <Accordion.Panel>Установите пакет и импортируйте компонент.</Accordion.Panel>
  </Accordion.Item>
</Accordion>`,
  adapterCode: `import { AccordionAdapter } from '@dreadnought/react/unstyled';

<AccordionAdapter className={styles.myAccordion}>
  <AccordionAdapter.Item value="install">
    <AccordionAdapter.Trigger>Установка</AccordionAdapter.Trigger>
    <AccordionAdapter.Panel>Инструкция.</AccordionAdapter.Panel>
  </AccordionAdapter.Item>
</AccordionAdapter>`,
  logicCode: `import { toggleAccordionValue } from '@dreadnought/core';

const next = toggleAccordionValue(null, 'install'); // 'install'`,
  adapterDescription: 'Адаптер даёт доступные кнопки и панели без библиотечного оформления или декоративного индикатора.',
  logicDescription: 'Чистая функция переключает открытый пункт. Для собственного компонента разметку, ARIA и состояние нужно собрать отдельно.',
  apiRows: [
    ['defaultValue', 'string | null | string[]', 'null / []', 'Первоначально открытые пункты'],
    ['value', 'string | null | string[]', '—', 'Открытые пункты в управляемом режиме'],
    ['onValueChange', 'function', '—', 'Уведомление об изменении открытых пунктов'],
    ['multiple', 'boolean', 'false', 'Позволяет открыть несколько пунктов'],
    ['Accordion.Item value', 'string', '—', 'Уникальное значение пункта'],
    ['Accordion.Trigger headingLevel', '1 | 2 | 3 | 4 | 5 | 6', '3', 'Уровень заголовка пункта'],
    ['Accordion.Trigger disabled', 'boolean', 'false', 'Блокирует раскрытие пункта'],
  ],
  footnote: <>Каждому <code>Accordion.Item</code> нужны ровно один <code>Trigger</code> и один <code>Panel</code>. Скрытая панель остаётся в DOM; для небольшого набора панелей можно добавить <code>role="region"</code>.</>,
  demo: <AccordionDemo />,
};
