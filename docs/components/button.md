# Button

Первый компонент Dreadnought. Его три уровня можно использовать независимо.

```tsx
import { Button } from '@dreadnought/ui';
import { ButtonAdapter } from '@dreadnought/react/unstyled';
import { useButton } from '@dreadnought/react/logic';
import '@dreadnought/themes/default.css';
```

`Button` — готовый компонент с вариантами `primary` и `secondary`. CSS темы подключается отдельно. Токены `--dreadnought-button-*` можно переопределить в контейнере проекта.

`ButtonCore` — тип результата вычисления состояния в первом слое. `ButtonAdapter` создаёт нативный `<button>` с тем же поведением, но без визуального варианта. Он принимает `icon` и `iconPosition="start" | "end"` (по умолчанию `start`); порядок иконки и текста задаётся здесь, оформление — темой. Отдельного `IconButton` нет: для кнопки без текста передайте `icon` и обязательный `aria-label` или `aria-labelledby`. `useButton` возвращает свойства для собственной разметки на нативном `<button>`.

Поддерживаются стандартные свойства кнопки, `disabled` и `loading`. По умолчанию используется `type="button"`. При `loading` действие блокируется, но кнопка остаётся в фокусе; выставляются `aria-disabled` и `aria-busy`. Явный `disabled` использует нативный атрибут. Состоянием асинхронной операции управляет вызывающий код.

Доступное имя задаётся текстом кнопки или `aria-label`/`aria-labelledby`. Первый вариант не поддерживает произвольный `as` и поведение переключателя `aria-pressed`.
