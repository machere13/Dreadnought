# TextArea

`TextArea` — готовое многострочное поле ввода с нативным поведением браузера.

```tsx
import { TextArea } from '@dreadnought/ui';

<label htmlFor="notes">Заметки</label>
<TextArea id="notes" name="notes" rows={4} />
```

`TextAreaAdapter` из `@dreadnought/react/unstyled` даёт элемент без стилей, а `useTextArea` из `@dreadnought/react/logic` возвращает `textAreaProps` и `state` для своей разметки. В первом слое состояние вычисляет `getTextAreaState`; общие для текстовых полей правила находятся в `getTextFieldState`.

Поддерживаются нативные `value`/`defaultValue`, `onChange`, `ref`, `rows`, `cols`, атрибуты формы, `disabled`, `readOnly`, `required`. `invalid` выставляет `aria-invalid="true"` и `data-invalid`, но не валидирует текст. Подпись передаётся отдельным `<label>` либо через ARIA. Автоматического изменения высоты нет: по умолчанию доступно нативное изменение размера по вертикали.

Внешний вид задаётся CSS Module и токенами `--dreadnought-text-area-*`. Их можно переопределить для темы или конкретного экземпляра через `className`.
