import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { Button, Drawer, Input } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

export const drawerDoc: ComponentDoc = {
  ...getCatalogDoc('drawer'),
  title: 'Drawer',
  description:
    'Модальная панель у края экрана для настроек, формы или подробностей. placement выбирает один из четырёх краёв, size задаёт ширину боковой панели или высоту верхней и нижней.',
  adapterDescription:
    'DrawerAdapter — публичный алиас ModalAdapter: native dialog, фокус, Escape, backdrop и блокировка прокрутки используют одну реализацию. Второй слой не подключает оформление или placement/size.',
  logicDescription:
    'useDrawer — алиас useModal, getDrawerState — алиас getModalState. Общий контракт позволяет собрать свою разметку; core не управляет DOM или стилями.',
  footnote: (
    <>
      По умолчанию placement="right"; число size — пиксели, строка — CSS-размер. Предоставьте
      доступное имя и кнопку с close(). mountPolicy="eager" по умолчанию создаёт содержимое сразу;
      "lazy" — при первом открытии, сохраняя его; "unmount" удаляет при закрытии. В примере unmount:
      после повторного открытия поле сбросится. Скрытые эффекты eager/lazy продолжают работать;
      внешнее состояние unmount не сбрасывает. В controlled-режиме родитель подтверждает
      onOpenChange через open. Без анимации. Необходим dialog.showModal().
    </>
  ),
  demo: (
    <div className={styles.demo}>
      <Drawer
        mountPolicy="unmount"
        aria-label="Настройки профиля"
        content={({ close }) => (
          <div style={{ display: 'grid', gap: 'var(--dreadnought-spacing-x4)' }}>
            <h2>Профиль</h2>
            <Input aria-label="Имя профиля" placeholder="Ваше имя" />
            <Button onClick={close}>Сохранить профиль</Button>
          </div>
        )}
      >
        {(trigger) => <Button {...trigger}>Настроить профиль</Button>}
      </Drawer>
    </div>
  ),
};

export function DrawerPage() {
  return <ComponentPage component="drawer" doc={drawerDoc} />;
}
