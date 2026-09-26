# Button

Первый компонент Dreadnought. Его три уровня можно использовать независимо.

```tsx
import { Button } from '@dreadnought/ui/react';
import { ButtonAdapter } from '@dreadnought/react/unstyled';
import { useButton } from '@dreadnought/react/logic';
```

`Button` — готовый React-компонент с вариантами `primary` и `secondary`. Импорт `@dreadnought/ui/react` подключает общий CSS оформления и стандартную тему. Пакет `@dreadnought/ui` также экспортирует `buttonPresentation` — карту классов для другого веб-адаптера, реализующего тот же DOM-контракт.

Внешний вид меняется токенами на контейнере, без переопределения CSS-классов компонента:

```css
.my-theme {
  --dreadnought-button-primary-bg: rgb(24 43 71 / 100%);
  --dreadnought-button-radius: 999px;
  --dreadnought-button-border-width: 1px;
  --dreadnought-button-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  --dreadnought-font-letter-spacing-button: 0.04em;
}
```

`Button.module.css` использует токены для настраиваемых значений: цветов, размеров, отступов, границ, тени, состояний, иконки и индикатора загрузки. Шрифтовой класс `.dreadnought-text-button` тоже читает токены темы — `font-family`, размер, насыщенность, высоту строки, межбуквенный интервал, начертание и регистр. Внутри репозитория общие значения лежат в `packages/themes/src/default/tokens/global/`, значения Button — в `tokens/components/Button/`; токены разбиты на файлы по назначению. Шрифтовой класс находится отдельно в `components/Button/typography.css`. При использовании готового компонента тема подключается автоматически; `@dreadnought/themes/default.css` нужен только при самостоятельном подключении темы без готовой точки входа. Пользовательский `className` добавляет класс к элементу, но не является контрактом для замены правил CSS Module. Если требуется другой порядок элементов или новая разметка, используйте `ButtonAdapter` со своим CSS Module.

`ButtonCore` — тип результата вычисления состояния в первом слое. `ButtonAdapter` создаёт нативный `<button>` для действия или `<a>` при передаче `href`, но не добавляет визуальный вариант. Он принимает `icon` и `iconPosition="start" | "end"` (по умолчанию `start`); порядок иконки и текста задаётся здесь, оформление — темой. Отдельного `IconButton` нет: для кнопки без текста передайте `icon` и обязательный `aria-label` или `aria-labelledby`. `useButton` возвращает свойства для собственной разметки на нативном `<button>`.

Поддерживаются стандартные свойства соответствующего элемента, `disabled` и `loading`. У кнопки по умолчанию используется `type="button"`; явный `disabled` включает нативный атрибут. При `loading` действие блокируется, но элемент остаётся в фокусе; выставляются `aria-disabled` и `aria-busy`. У ссылки в состояниях `disabled` и `loading` временно убирается `href`, чтобы заблокировать навигацию; отключённая ссылка исключается из порядка Tab. Состоянием асинхронной операции управляет вызывающий код.

Тип `ref` зависит от `href`: без него это `HTMLButtonElement`, с ним — `HTMLAnchorElement`. Готовый React-компонент рассчитан на React 19; CSS и карта классов из `@dreadnought/ui` от React не зависят.

Доступное имя задаётся текстом или `aria-label`/`aria-labelledby`. Произвольный `as` и поведение переключателя `aria-pressed` не поддерживаются.
