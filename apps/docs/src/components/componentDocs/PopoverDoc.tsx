import { Button, Input, Popover } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

export const popoverDoc: ComponentDoc = {
  ...getCatalogDoc('popover'), title: 'Popover',
  description: 'Интерактивная панель рядом с кнопкой: для полей, ссылок и действий. Открывается по клику, закрывается повторным кликом, Escape, кликом снаружи или выходом фокуса. Поддерживает 12 положений и стрелку.',
  adapterDescription: 'PopoverAdapter управляет раскрытием, позиционированием и фокусом без оформления. Использует native Popover API для верхнего слоя; контролируемое open остаётся решением родителя.',
  logicDescription: 'usePopover возвращает triggerProps, contentProps, open, show() и close(). getPopoverState из core задаёт доступную связь между кнопкой и немодальной панелью, а getTooltipPosition рассчитывает положение без привязки к React.',
  footnote: <>При открытии фокус переходит на первый доступный элемент или саму панель. Escape и close() возвращают его на кнопку; Tab свободно выходит наружу. Если родитель закрывает панель с фокусом внутри, он также возвращается на кнопку; фокус снаружи не перехватывается. Задайте aria-label для собственного имени панели. Для неинтерактивной подсказки используйте Tooltip, для меню — Menu. Оформление меняется через --dreadnought-popover-*.</>,
  demo: <div className={styles.demo}><Popover aria-label="Настройки профиля" content={({ close }) => <div style={{ display: 'grid', gap: 'var(--dreadnought-spacing-x3)' }}>
    <Input aria-label="Имя профиля" placeholder="Ваше имя" /><Button onClick={close}>Готово</Button>
  </div>}>{trigger => <Button {...trigger}>Настройки профиля</Button>}</Popover>
  <Popover placement="right" arrow={false} content="Панель может содержать и обычный текст.">{trigger => <Button {...trigger}>Без стрелки</Button>}</Popover></div>,
};
