import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import { Accordion, Input } from '@dreadnought/ui/react';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

function AccordionDemo() {
  return (
    <div className={styles.demo}>
      <Accordion>
        <Accordion.Item value="connect">
          <Accordion.Trigger>Как подключить компонент?</Accordion.Trigger>
          <Accordion.Panel>
            Импортируйте готовый компонент из @dreadnought/ui/react.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="theme">
          <Accordion.Trigger>Как изменить оформление?</Accordion.Trigger>
          <Accordion.Panel>Задайте значения публичных токенов темы.</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

function AccordionLifecycleDemo() {
  const policies = ['eager', 'lazy', 'unmount'] as const;
  return (
    <div className={styles.demo}>
      <h3>Состояние содержимого</h3>
      <p>Введите текст, закройте раздел и откройте снова. В unmount поле сбросится.</p>
      <Accordion>
        {policies.map((policy) => (
          <Accordion.Item key={policy} value={policy}>
            <Accordion.Trigger>{policy}</Accordion.Trigger>
            <Accordion.Panel mountPolicy={policy}>
              <Input aria-label={`Текст ${policy}`} placeholder="Введите текст" />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}

export const accordionDoc: ComponentDoc = {
  ...getCatalogDoc('accordion'),
  title: 'Accordion',
  description:
    'Раскрывающиеся разделы для FAQ и пояснений. Поддерживает один или несколько открытых пунктов.',
  adapterDescription:
    'Адаптер даёт доступные кнопки и панели без библиотечного оформления или декоративного индикатора.',
  logicDescription:
    'Чистая функция переключает открытый пункт. Для собственного компонента разметку, ARIA и состояние нужно собрать отдельно.',
  footnote: (
    <>
      Каждому <code>Accordion.Item</code> нужны ровно один <code>Trigger</code> и один{' '}
      <code>Panel</code>. <code>mountPolicy</code> панели: <code>eager</code> создаёт содержимое
      сразу, <code>lazy</code> — при первом открытии и сохраняет, <code>unmount</code> — удаляет при
      закрытии. По умолчанию <code>eager</code>; оболочка остаётся во всех режимах. При unmount
      очищаются эффекты и локальное состояние, но внешнее состояние сохраняется. Сохранение
      содержимого не приостанавливает эффекты. Для небольшого набора панелей можно добавить{' '}
      <code>role="region"</code>.
    </>
  ),
  demo: (
    <>
      <AccordionDemo />
      <AccordionLifecycleDemo />
    </>
  ),
};

export function AccordionPage() {
  return <ComponentPage component="accordion" doc={accordionDoc} />;
}
