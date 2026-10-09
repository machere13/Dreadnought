import { useState } from 'react';
import { Button, Toast, ToastViewport } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function ToastDemo() {
  const [items, setItems] = useState<number[]>([]);
  const [nextId, setNextId] = useState(0);
  return <div className={styles.demo}>
    <Button onClick={() => { setItems(items => [...items, nextId]); setNextId(nextId + 1); }}>Показать уведомление</Button>
    <ToastViewport placement="top-end" aria-label="Уведомления">
      {items.map(id => <Toast key={id} title="Изменения сохранены" description="Наведите курсор или перейдите к кнопке закрытия, чтобы остановить отсчёт."
        type="success" closeLabel="Закрыть уведомление" onOpenChange={open => { if (!open) setItems(items => items.filter(item => item !== id)); }} />)}
    </ToastViewport>
  </div>;
}

export const toastDoc: ComponentDoc = {
  ...getCatalogDoc('toast'), title: 'Toast',
  description: 'Временное всплывающее уведомление о результате операции. Не меняет раскладку страницы и не перехватывает фокус.',
  adapterDescription: 'Адаптер управляет видимостью, оставшимся временем, паузой при наведении и фокусе. Контейнер второго слоя не задаёт положение и оформление.',
  logicDescription: <>Первый слой вычисляет семантику через <code>getToastState</code>, а общее поведение <code>getCountdownRemaining</code> позволяет собрать собственный таймер. Часы и планирование остаются в адаптере.</>,
  demo: <ToastDemo />,
  footnote: <>Монтируйте один <code>ToastViewport</code> в корне приложения. Положения: <code>top-start / top / top-end / bottom-start / bottom / bottom-end</code>. Время задаётся в миллисекундах; <code>duration=0</code> отключает автоматическое закрытие. Для важного действия оставляйте уведомление постоянным. Controlled-режим требует изменения <code>open</code> владельцем.</>,
};
