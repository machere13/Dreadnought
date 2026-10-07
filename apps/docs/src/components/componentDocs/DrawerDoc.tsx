import { Button, Drawer, Input } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

export const drawerDoc: ComponentDoc = {
  ...getCatalogDoc('drawer'), title: 'Drawer',
  description: 'Модальная панель у края экрана для настроек, формы или подробностей. placement выбирает один из четырёх краёв, size задаёт ширину боковой панели или высоту верхней и нижней.',
  adapterDescription: 'DrawerAdapter — публичный алиас ModalAdapter: native dialog, фокус, Escape, backdrop и блокировка прокрутки используют одну реализацию. Второй слой не подключает оформление или placement/size.',
  logicDescription: 'useDrawer — алиас useModal, getDrawerState — алиас getModalState. Общий контракт позволяет собрать свою разметку; core не управляет DOM или стилями.',
  footnote: <>По умолчанию placement="right", размер берётся из --dreadnought-drawer-size. Положительное конечное число size — пиксели, строка — CSS-размер. Панель ограничена viewport, длинное содержимое прокручивается внутри. Предоставьте доступное имя и кнопку с close(). В controlled-режиме родитель подтверждает onOpenChange через open. Открытие и закрытие немедленные, без анимации; содержимое сохраняется. Необходим dialog.showModal().</>,
  demo: <div className={styles.demo}><Drawer aria-label="Настройки профиля" content={({ close }) =>
    <div style={{ display: 'grid', gap: 'var(--dreadnought-spacing-x4)' }}>
      <h2>Профиль</h2><Input aria-label="Имя профиля" placeholder="Ваше имя" />
      <Button onClick={close}>Сохранить профиль</Button>
    </div>}>{trigger => <Button {...trigger}>Настроить профиль</Button>}</Drawer></div>,
};
