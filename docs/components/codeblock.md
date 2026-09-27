# CodeBlock

Показывает исходный код и по умолчанию добавляет кнопку копирования. Строка `code` выводится как обычный текст и копируется без изменений, включая пробелы и завершающий перевод строки. Подсветки синтаксиса в первой версии нет.

```tsx
import { CodeBlock } from '@dreadnought/ui/react';

<CodeBlock code={'const answer = 42;\n'} language="ts" />;
```

`copyable={false}` убирает кнопку. Если при этом не задан `language`, заголовок блока не создаётся. Подписи кнопки настраиваются через `copyLabels={{ copy, copied, error }}`. После успешного копирования вызывается `onCopy(code)`, при ошибке — `onCopyError(error)`. Состояние «Скопировано» остаётся до следующей попытки или смены `code`; таймера нет.

Готовый компонент использует стандартную тему. Поменять её можно через токены `--dreadnought-code-block-*`; конкретный экземпляр — через `className` и `slotClassNames` (`header`, `pre`, `code`, `copyButton`). Кнопка копирования использует оформление `Button` в сочетании `compact` + `ghosted`, поэтому её цвета и размеры настраиваются токенами `--dreadnought-button-*`. Сам `CodeBlockAdapter` остаётся без библиотечных стилей.

Для собственной разметки без библиотечного оформления доступен второй слой:

```tsx
import { CodeBlockAdapter } from '@dreadnought/react/unstyled';

<CodeBlockAdapter code="npm install" copyable={false} slotClassNames={{ pre: 'my-code' }} />;
```

Если вообще не нужен готовый блок, используйте действие первого слоя в своём компоненте:

```ts
import { copy } from '@dreadnought/core';

await copy('текст для копирования');
```
