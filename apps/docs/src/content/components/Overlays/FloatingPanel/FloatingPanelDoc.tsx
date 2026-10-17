import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { FloatingPanelDraftDemo } from './FloatingPanelDraftDemo.tsx';
import draftCode from './FloatingPanelDraftDemo.tsx?raw';
import { FloatingPanelControlledDemo } from './FloatingPanelControlledDemo.tsx';
import controlledCode from './FloatingPanelControlledDemo.tsx?raw';

export const floatingPanelDoc: ComponentDoc = {
  ...getCatalogDoc('floatingpanel'),
  title: 'FloatingPanel',
  usage:
    'Для чата, обратной связи или помощника, пока остальная страница остаётся доступной. Для обязательного подтверждения действия используйте Modal.',
  primaryProps: ['open', 'onOpenChange', 'title', 'content', 'footer', 'placement', 'closable'],
  description: 'Вспомогательное окно у края экрана, не блокирующее страницу.',
  adapterDescription:
    'FloatingPanelAdapter управляет раскрытием, portal и фокусом без оформления. Содержимое сохраняется после закрытия. children возвращает кнопку с triggerProps, включая ref.',
  logicDescription:
    'useFloatingPanel возвращает triggerProps, contentProps, open, show() и close(). getFloatingPanelState переиспользует немодальное состояние disclosure из core.',
  notes: [
    'Передавайте triggerProps на кнопку целиком, включая ref.',
    'Escape внутри, крестик или close() запрашивают закрытие.',
    'Фокус возвращается на кнопку, если оставался внутри.',
    'Tab может выйти на страницу.',
    'rootStyle задаёт положение контейнера и публичные токены размера.',
    'В примерах увеличены отступы, чтобы кнопки не перекрывали помощника документации.',
    'Отправка данных и логика чата относятся к приложению.',
  ],
  examples: [
    {
      id: 'draft',
      title: 'Панель с сохраняемым черновиком',
      description:
        'Откройте «Обратная связь» кнопкой в нижнем правом углу, введите сообщение и нажмите «Готово». При повторном открытии текст останется. «Готово» только закрывает панель и ничего не отправляет. Клик по странице не закрывает её.',
      demo: <FloatingPanelDraftDemo />,
      code: draftCode,
    },
    {
      id: 'controlled',
      title: 'Положение и управление из приложения',
      description:
        'Выберите один из четырёх углов и нажмите «Открыть извне». Положение можно менять и при открытой панели. «Закрыть извне» меняет open в родителе; крестик и Escape передают запрос через onOpenChange. Страница остаётся доступной.',
      demo: <FloatingPanelControlledDemo />,
      code: controlledCode,
    },
  ],
};

export function FloatingPanelPage() {
  return <ComponentPage component="floatingpanel" doc={floatingPanelDoc} />;
}
