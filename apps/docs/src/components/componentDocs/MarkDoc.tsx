import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import { Mark } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function MarkDemo() {
  return <div className={styles.demo}>
    <ul className={styles.specimenGrid} aria-label="Формы маркера">
      <li className={styles.specimen}><Mark shape="circle" /><span>circle · цвет темы</span></li>
      <li className={styles.specimen}><Mark shape="square" color="var(--dreadnought-color-status-success)" /><span>square · локальный цвет</span></li>
    </ul>
  </div>;
}

export const markDoc: ComponentDoc = {
  ...getCatalogDoc('mark'),
  title: 'Mark',
  description: 'Небольшой декоративный маркер для статуса или метки. Выбирайте форму и при необходимости задавайте цвет конкретного экземпляра.',
  adapterDescription: 'Адаптер выводит декоративный элемент с выбранной формой; размер и цвет задаются вашими стилями.',
  footnote: <>Mark всегда скрыт от скринридера. Если цвет или форма передают смысл, продублируйте его текстом рядом. Без <code>color</code> используется компонентный токен темы.</>,
  demo: <MarkDemo />,
};
