import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { Button, Input, Modal } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

export const modalDoc: ComponentDoc = {
  ...getCatalogDoc('modal'),
  title: 'Modal',
  description:
    'Модальное окно с шапкой, содержимым и необязательным футером. Блокирует фон и прокрутку страницы; закрывается крестиком, по Escape или клику по фону.',
  adapterDescription:
    'ModalAdapter связывает состояние React с native dialog: showModal(), cancel, close, возврат фокуса и блокировка прокрутки. Не подключает оформление темы.',
  logicDescription:
    'useModal возвращает open, triggerProps, contentProps и close(). getModalState из core задаёт семантику и связь триггера с окном; состояние вычисляется через общие disclosure behaviors без DOM.',
  footnote: (
    <>
      title — шапка, content — содержимое, footer — действия снизу. mountPolicy="eager" по умолчанию
      создаёт содержимое сразу; "lazy" — при первом открытии, сохраняя его; "unmount" удаляет при
      закрытии вместе с шапкой и футером. В примере unmount: закройте окно и откройте снова — поле
      сбросится. Скрытые эффекты eager/lazy продолжают работать; внешнее состояние unmount не
      сбрасывает. closable=false скрывает только крестик. В controlled-режиме родитель подтверждает
      onOpenChange через open.
    </>
  ),
  demo: (
    <div className={styles.demo}>
      <Modal
        mountPolicy="unmount"
        title="Профиль"
        aria-label="Редактирование профиля"
        content={<Input aria-label="Имя профиля" placeholder="Ваше имя" />}
        footer={({ close }) => (
          <>
            <Button variant="secondary" onClick={close}>
              Отмена
            </Button>
            <Button onClick={close}>Сохранить профиль</Button>
          </>
        )}
      >
        {(trigger) => <Button {...trigger}>Редактировать профиль</Button>}
      </Modal>
    </div>
  ),
};

export function ModalPage() {
  return <ComponentPage component="modal" doc={modalDoc} />;
}
