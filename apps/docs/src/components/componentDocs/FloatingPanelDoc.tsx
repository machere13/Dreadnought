import { Button, FloatingPanel, TextArea } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

export const floatingPanelDoc: ComponentDoc = {
  ...getCatalogDoc('floatingpanel'), title: 'FloatingPanel',
  description: 'Немодальное окно у края экрана: для обратной связи, чата или вспомогательных действий. Страница остаётся доступной, панель не закрывается от внешнего клика.',
  adapterDescription: 'FloatingPanelAdapter управляет раскрытием, portal и фокусом без оформления. Содержимое сохраняется после закрытия. children возвращает кнопку с triggerProps, включая ref.',
  logicDescription: 'useFloatingPanel возвращает triggerProps, contentProps, open, show() и close(). getFloatingPanelState переиспользует немодальное состояние disclosure из core.',
  footnote: <>Escape внутри или крестик закрывают панель; Tab свободно выходит на страницу. При закрытии фокус возвращается на кнопку только если оставался внутри. Ширина, высота и отступы задаются через --dreadnought-floating-panel-* в rootStyle. AI, история сообщений и отправка данных — ответственность приложения.</>,
  demo: <div className={styles.demo}>
    <p>Откройте панель кнопкой в углу экрана. Ввод сохраняется после закрытия.</p>
    <FloatingPanel title="Обратная связь" content={<TextArea aria-label="Сообщение" placeholder="Ваше сообщение" />}
      footer={({ close }) => <Button onClick={close}>Готово</Button>}>
      {trigger => <Button {...trigger}>Обратная связь</Button>}
    </FloatingPanel>
  </div>,
};
