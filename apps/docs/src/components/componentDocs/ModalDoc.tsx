import { Button, Input, Modal } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

export const modalDoc: ComponentDoc = {
  ...getCatalogDoc('modal'), title: 'Modal',
  description: 'Модальное окно для форм и действий. Блокирует фон и прокрутку страницы, закрывается по Escape, клику по фону или close(). Содержимое, заголовок и кнопки задаются приложением.',
  adapterDescription: 'ModalAdapter связывает состояние React с native dialog: showModal(), cancel, close, возврат фокуса и блокировка прокрутки. Не подключает оформление темы.',
  logicDescription: 'useModal возвращает open, triggerProps, contentProps и close(). getModalState из core задаёт семантику и связь триггера с окном; состояние вычисляется через общие disclosure behaviors без DOM.',
  footnote: <>В controlled-режиме onOpenChange запрашивает изменение, а родитель подтверждает его через open. closeOnEscape и closeOnBackdrop позволяют отключить соответствующее закрытие. Предоставьте кнопку с close() и доступное имя окна. Нативный dialog выбирает начальный фокус; autoFocus задаёт приоритетный элемент. Закрытое окно сохраняет содержимое. Оформление меняется через --dreadnought-modal-*. Поддержка dialog.showModal() обязательна.</>,
  demo: <div className={styles.demo}><Modal aria-label="Редактирование профиля" content={({ close }) =>
    <div style={{ display: 'grid', gap: 'var(--dreadnought-spacing-x4)' }}>
      <h2>Профиль</h2><Input aria-label="Имя профиля" placeholder="Ваше имя" />
      <Button onClick={close}>Сохранить профиль</Button>
    </div>}>{trigger => <Button {...trigger}>Редактировать профиль</Button>}</Modal></div>,
};
