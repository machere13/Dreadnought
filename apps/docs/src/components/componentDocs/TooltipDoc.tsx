import { Button, Tooltip } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

export const tooltipDoc: ComponentDoc = {
  ...getCatalogDoc('tooltip'), title: 'Tooltip',
  description: 'Короткая подсказка при наведении и фокусе. Поддерживает 12 положений, стрелку и автоматическую смену стороны у края экрана. Задержки openDelay и closeDelay задаются в миллисекундах: по умолчанию 100, 0 отключает задержку. Фокус показывает сразу, Escape закрывает сразу.',
  adapterDescription: 'TooltipAdapter содержит то же поведение и позиционирование без готового оформления. Render-функция позволяет использовать HTML или SVG без дополнительной обёртки.',
  logicDescription: 'useTooltip возвращает свойства целевого элемента и подсказки. getTooltipState из core формирует доступную связь aria-describedby независимо от фреймворка.',
  footnote: <>Целевой элемент должен быть доступен с клавиатуры и иметь собственное доступное имя. Подсказка дополняет его, но не заменяет. Не размещайте внутри кнопки, ссылки и поля. Передайте свойства render-функции одному целевому элементу. Оформление меняется через --dreadnought-tooltip-*.</>,
  demo: <div className={styles.demo}><Tooltip content="Открывает настройки приложения" placement="top">{trigger => <Button {...trigger}>Настройки</Button>}</Tooltip><Tooltip content="Подсказка справа" placement="right">{trigger => <Button {...trigger}>Справа</Button>}</Tooltip><Tooltip content="Без стрелки" arrow={false}>{trigger => <Button {...trigger}>Без стрелки</Button>}</Tooltip><Tooltip content="Появляется и скрывается мгновенно" openDelay={0} closeDelay={0}>{trigger => <Button {...trigger}>Без задержки</Button>}</Tooltip></div>,
};
