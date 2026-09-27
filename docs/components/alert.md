# Alert

Постоянное уведомление внутри страницы. `type` задаёт смысл (`info`, `success`, `warning`, `error`), `variant` — оформление (`outlined` или `filled`). `showIcon` включает подходящий значок; без него место под значок не резервируется.

```tsx
import { Alert } from '@dreadnought/ui/react';

<Alert type="info" title="Важно" description="Настройки будут применены после сохранения." />;
```

Для ошибки RAG-помощника можно передать действие. Оно не смешивается с закрытием уведомления:

```tsx
import { Alert, Button } from '@dreadnought/ui/react';

<Alert
  type="error"
  title="Не удалось получить ответ"
  description="Попробуйте ещё раз."
  action={<Button onClick={retry}>Повторить</Button>}
/>;
```

`closable` добавляет кнопку закрытия. Закрывается только этот экземпляр; `onClose` получает событие клика. Свою иконку можно передать через `icon`, а свою иконку закрытия — через `closable.closeIcon`.

```tsx
<Alert
  type="success"
  title="Готово"
  showIcon
  closable={{ 'aria-label': 'Закрыть сообщение', onClose: () => logDismissal() }}
/>;
```

Готовый компонент использует токены `--dreadnought-alert-*`, которые ссылаются на глобальные роли темы. Для отдельного экземпляра задайте токены через `className`; для всей темы измените глобальные или компонентные токены. Внутренние части доступны через `slotClassNames` (`icon`, `title`, `description`, `actions`, `close`). Никаких `!important` не требуется.

Для собственной внешности используйте второй слой: `AlertAdapter` из `@dreadnought/react/unstyled`. Он сохраняет разметку, семантику и локальное закрытие, но не подключает стили и стандартные иконки.

```tsx
import { AlertAdapter } from '@dreadnought/react/unstyled';

<AlertAdapter type="warning" title="Внимание" className="myAlert" closable />;
```

`warning` и `error` по умолчанию объявляются как `role="alert"`, `info` и `success` — как `role="status"`. При необходимости роль можно задать явно. Закрытие не управляется извне: чтобы показать уведомление заново, нужно смонтировать новый экземпляр.
