import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
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
  ...getCatalogDoc('accordion'),
  title: 'Accordion',
  description: 'Раскрывающиеся разделы для FAQ и пояснений. Поддерживает один или несколько открытых пунктов.',
  adapterDescription: 'Адаптер даёт доступные кнопки и панели без библиотечного оформления или декоративного индикатора.',
  logicDescription: 'Чистая функция переключает открытый пункт. Для собственного компонента разметку, ARIA и состояние нужно собрать отдельно.',
  footnote: <>Каждому <code>Accordion.Item</code> нужны ровно один <code>Trigger</code> и один <code>Panel</code>. Скрытая панель остаётся в DOM; для небольшого набора панелей можно добавить <code>role="region"</code>.</>,
  demo: <AccordionDemo />,
};
