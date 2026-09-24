# Button

Первый компонент Morpha. Его три уровня можно использовать независимо.

```tsx
import { Button } from '@morpha/react';
import { ButtonBase } from '@morpha/react/unstyled';
import { useButton } from '@morpha/react/logic';
import '@morpha/themes/default.css';
```

`Button` — готовый компонент с вариантами `primary` и `secondary`. CSS темы подключается отдельно. Токены `--morpha-button-*` можно переопределить в контейнере проекта.

`ButtonBase` создаёт нативный `<button>` с тем же поведением, но без визуального варианта. `useButton` возвращает свойства для собственной разметки на нативном `<button>`.

Поддерживаются стандартные свойства кнопки, `disabled` и `loading`. По умолчанию используется `type="button"`. При `loading` действие блокируется, но кнопка остаётся в фокусе; выставляются `aria-disabled` и `aria-busy`. Явный `disabled` использует нативный атрибут. Состоянием асинхронной операции управляет вызывающий код.

Доступное имя задаётся текстом кнопки или `aria-label`/`aria-labelledby`. Первый вариант не поддерживает произвольный `as` и поведение переключателя `aria-pressed`.
