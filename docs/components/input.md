# Input

`Input` — готовое однострочное текстовое поле. Поддерживаются `text` (по умолчанию), `email`, `password`, `search`, `tel` и `url`. Для других типов нужны отдельные контракты.

```tsx
import { Input } from '@dreadnought/react/styled';

<label htmlFor="email">Электронная почта</label>
<Input id="email" type="email" name="email" required />
```

`Input type="password"` добавляет кнопку показа и скрытия пароля. Текст кнопки по умолчанию английский; для другого языка передайте `passwordVisibilityLabels`:

```tsx
<Input id="password" type="password" passwordVisibilityLabels={{ show: 'Показать пароль', hide: 'Скрыть пароль' }} />
```

`InputAdapter` из `@dreadnought/react/unstyled` создаёт неоформленную обёртку с нативным полем и, только для пароля, кнопкой `type="button"`. `useInput` из `@dreadnought/react/logic` возвращает `inputProps`, `state` и для пароля `visibilityButtonProps`/`isPasswordVisible`, чтобы собрать собственную разметку с тем же переключением. В первом слое `getInputState` из `@dreadnought/core` вычисляет состояние поля независимо от React.

Сохраняются нативные `value`/`defaultValue`, `onChange`, `ref`, участие в форме, `disabled`, `readOnly` и `required`. `invalid` выставляет `aria-invalid="true"` и `data-invalid`, но не запускает валидацию. Подпись передаётся отдельным `<label>` либо через ARIA; `placeholder` её не заменяет.

Обёртка несёт `data-ui="input"`; само поле — `data-slot="control"`, а кнопка пароля — `data-slot="visibility-toggle"`. `className` и `style` относятся к обёртке, тогда как `ref`, `id`, `name` и остальные нативные свойства относятся к `<input>`. Внешний вид задаётся общим CSS из `@dreadnought/ui` и токенами `--dreadnought-input-*`; нативное поле остаётся прозрачным и без собственной рамки. Для другого веб-фреймворка доступна карта `inputPresentation` из `@dreadnought/ui`, если адаптер воспроизводит тот же DOM-контракт. Переопределяйте токен компонента в теме проекта или для отдельного экземпляра через `className`/`style`.
