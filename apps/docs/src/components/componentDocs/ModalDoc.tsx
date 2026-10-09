import { Button, Input, Modal } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

export const modalDoc: ComponentDoc = {
  ...getCatalogDoc('modal'), title: 'Modal',
  description: 'Модальное окно с шапкой, содержимым и необязательным футером. Блокирует фон и прокрутку страницы; закрывается крестиком, по Escape или клику по фону.',
  adapterDescription: 'ModalAdapter связывает состояние React с native dialog: showModal(), cancel, close, возврат фокуса и блокировка прокрутки. Не подключает оформление темы.',
  logicDescription: 'useModal возвращает open, triggerProps, contentProps и close(). getModalState из core задаёт семантику и связь триггера с окном; состояние вычисляется через общие disclosure behaviors без DOM.',
  footnote: <>title — заголовок шапки, content — содержимое, footer — действия снизу. Без footer нижний блок не создаётся. Длинное содержимое прокручивается отдельно. title задаёт доступное имя, если не указаны aria-label или aria-labelledby. closable=false скрывает крестик; Escape и фон настраиваются отдельно. В controlled-режиме родитель подтверждает onOpenChange через open.</>,
  demo: <div className={styles.demo}>
    <Modal
      title="Профиль"
      aria-label="Редактирование профиля"
      content={<Input aria-label="Имя профиля" placeholder="Ваше имя" />}
      footer={({ close }) => <>
        <Button variant="secondary" onClick={close}>Отмена</Button>
        <Button onClick={close}>Сохранить профиль</Button>
      </>}
    >
      {trigger => <Button {...trigger}>Редактировать профиль</Button>}
    </Modal>
  </div>,
};
