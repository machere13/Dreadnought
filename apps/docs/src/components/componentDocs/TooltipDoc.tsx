import { Button, Tooltip } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

export const tooltipDoc: ComponentDoc = {
  ...getCatalogDoc('tooltip'), title: 'Tooltip',
  description: 'Короткая подсказка при наведении и фокусе. Удерживается при наведении на саму подсказку; Escape закрывает её.',
  adapterDescription: 'TooltipAdapter содержит то же поведение и позиционирование без готового оформления. Render-функция позволяет использовать HTML или SVG без дополнительной обёртки.',
  logicDescription: 'useTooltip возвращает свойства целевого элемента и подсказки. getTooltipState из core формирует доступную связь aria-describedby независимо от фреймворка.',
  footnote: <>Целевой элемент должен быть доступен с клавиатуры и иметь собственное доступное имя. Подсказка дополняет его, но не заменяет. Не размещайте внутри кнопки, ссылки и поля. Передайте свойства render-функции одному целевому элементу. Оформление меняется через --dreadnought-tooltip-*.</>,
  demo: <div className={styles.demo}><Tooltip content="Открывает настройки приложения">{trigger => <Button {...trigger}>Настройки</Button>}</Tooltip></div>,
};
