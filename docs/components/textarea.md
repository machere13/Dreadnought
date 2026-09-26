# TextArea

`TextArea` — готовое многострочное поле ввода с нативным поведением браузера.

```tsx
import { TextArea } from '@dreadnought/ui/react';

<label htmlFor="notes">Заметки</label>
<TextArea id="notes" name="notes" rows={4} />
```

`TextAreaAdapter` из `@dreadnought/react/unstyled` даёт элемент без стилей, а `useTextArea` из `@dreadnought/react/logic` возвращает `textAreaProps` и `state` для своей разметки. В первом слое состояние вычисляет `getTextAreaState`; общие для текстовых полей правила находятся в `getTextFieldState`.

Поддерживаются нативные `value`/`defaultValue`, `onChange`, `ref`, `rows`, `cols`, атрибуты формы, `disabled`, `readOnly`, `required`. `invalid` выставляет `aria-invalid="true"` и `data-invalid`, но не валидирует текст. Подпись передаётся отдельным `<label>` либо через ARIA.

```tsx
<TextArea rows={4} minRows={2} maxRows={8} />
<TextArea rows={4} autoSize maxRows={8} />
```

По умолчанию `rows` задаёт начальную высоту, пользователь меняет её мышкой, а `minRows` и `maxRows` ограничивают диапазон. С `autoSize` высота следует за содержимым, а перетаскивание отключено. В этом режиме нижняя граница — `minRows`, если она задана, иначе `rows`; `maxRows` задаёт верхнюю. При достижении максимума появляется прокрутка. Значения строк должны быть положительными целыми числами, `minRows` не может превышать `maxRows`.

Для собственной разметки `useTextArea` возвращает `textAreaRef`: его нужно передать нативному элементу вместе с `textAreaProps`, чтобы работал `autoSize`. Динамическая высота задаётся React-слоем, а ограничения ручного изменения размера готового компонента — через его CSS Module.

Внешний вид задаётся общим CSS из `@dreadnought/ui` и токенами `--dreadnought-text-area-*`. Их можно переопределить для темы или конкретного экземпляра через `className`. Другой веб-адаптер может использовать `textAreaPresentation` из `@dreadnought/ui` при соблюдении того же DOM-контракта.
