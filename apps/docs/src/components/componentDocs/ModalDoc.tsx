import { Button, Input, Modal } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

export const modalDoc: ComponentDoc = {
  ...getCatalogDoc('modal'), title: 'Modal',
  description: 'Модальное окно для форм и действий. Блокирует фон и прокрутку страницы, закрывается крестиком, по Escape, клику по фону или close(). Содержимое и заголовок задаются приложением.',
  adapterDescription: 'ModalAdapter связывает состояние React с native dialog: showModal(), cancel, close, возврат фокуса и блокировка прокрутки. Не подключает оформление темы.',
  logicDescription: 'useModal возвращает open, triggerProps, contentProps и close(). getModalState из core задаёт семантику и связь триггера с окном; состояние вычисляется через общие disclosure behaviors без DOM.',
  footnote: <>closable=false скрывает крестик; closeIcon и closeLabel меняют иконку и доступную подпись. Escape и закрытие по фону отключаются отдельно через closeOnEscape и closeOnBackdrop. В controlled-режиме родитель подтверждает onOpenChange через open. Задайте доступное имя окна; autoFocus выбирает начальный фокус.</>,
  demo: <div className={styles.demo}><Modal aria-label="Редактирование профиля" content={({ close }) =>
    <div style={{ display: 'grid', gap: 'var(--dreadnought-spacing-x4)' }}>
      <h2>Профиль</h2><Input aria-label="Имя профиля" placeholder="Ваше имя" />
      <Button onClick={close}>Сохранить профиль</Button>
    </div>}>{trigger => <Button {...trigger}>Редактировать профиль</Button>}</Modal></div>,
};
