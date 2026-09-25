# Button

Первый компонент Dreadnought. Его три уровня можно использовать независимо.

```tsx
import { Button } from '@dreadnought/ui';
import { ButtonAdapter } from '@dreadnought/react/unstyled';
import { useButton } from '@dreadnought/react/logic';
import '@dreadnought/themes/default.css';
```

`Button` — готовый компонент с вариантами `primary` и `secondary`. CSS темы подключается отдельно. Токены `--dreadnought-button-*` можно переопределить в контейнере проекта.

`ButtonCore` — тип результата вычисления состояния в первом слое. `ButtonAdapter` создаёт нативный `<button>` для действия или `<a>` при передаче `href`, но не добавляет визуальный вариант. Он принимает `icon` и `iconPosition="start" | "end"` (по умолчанию `start`); порядок иконки и текста задаётся здесь, оформление — темой. Отдельного `IconButton` нет: для кнопки без текста передайте `icon` и обязательный `aria-label` или `aria-labelledby`. `useButton` возвращает свойства для собственной разметки на нативном `<button>`.

Поддерживаются стандартные свойства соответствующего элемента, `disabled` и `loading`. У кнопки по умолчанию используется `type="button"`; явный `disabled` включает нативный атрибут. При `loading` действие блокируется, но элемент остаётся в фокусе; выставляются `aria-disabled` и `aria-busy`. У ссылки в состояниях `disabled` и `loading` временно убирается `href`, чтобы заблокировать навигацию; отключённая ссылка исключается из порядка Tab. Состоянием асинхронной операции управляет вызывающий код.

Тип `ref` зависит от `href`: без него это `HTMLButtonElement`, с ним — `HTMLAnchorElement`. Пакеты React-адаптера и готового компонента рассчитаны на React 19.

Доступное имя задаётся текстом или `aria-label`/`aria-labelledby`. Произвольный `as` и поведение переключателя `aria-pressed` не поддерживаются.
