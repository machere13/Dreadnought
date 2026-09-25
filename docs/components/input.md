# Input

`Input` — готовое однострочное текстовое поле. Поддерживаются `text` (по умолчанию), `email`, `password`, `search`, `tel` и `url`. Для других типов нужны отдельные контракты.

```tsx
import { Input } from '@dreadnought/ui';

<label htmlFor="email">Электронная почта</label>
<Input id="email" type="email" name="email" required />
```

`InputAdapter` из `@dreadnought/react/unstyled` даёт нативный элемент без оформления. `useInput` из `@dreadnought/react/logic` возвращает `inputProps` и `state` для своей разметки. В первом слое `getInputState` из `@dreadnought/core` вычисляет состояние независимо от React.

Сохраняются нативные `value`/`defaultValue`, `onChange`, `ref`, участие в форме, `disabled`, `readOnly` и `required`. `invalid` выставляет `aria-invalid="true"` и `data-invalid`, но не запускает валидацию. Подпись передаётся отдельным `<label>` либо через ARIA; `placeholder` её не заменяет.

Внешний вид задаётся CSS Module и токенами `--dreadnought-input-*`. Переопределяйте токен компонента в теме проекта или для отдельного экземпляра через `className`.
