# Accordion

Составной компонент для FAQ и дополнительных разделов документации. По умолчанию все панели закрыты; повторный клик закрывает открытый пункт.

```tsx
import { Accordion } from '@dreadnought/ui/react';

<Accordion>
  <Accordion.Item value="install">
    <Accordion.Trigger>Как установить?</Accordion.Trigger>
    <Accordion.Panel>Установите пакет и импортируйте компонент.</Accordion.Panel>
  </Accordion.Item>
</Accordion>;
```

`Accordion.Item` нужен уникальный непустой `value` и ровно по одному `Trigger` и `Panel`. В одиночном режиме `defaultValue="install"` открывает пункт изначально; `defaultValue={null}` и отсутствие значения оставляют всё закрытым. `multiple` включает несколько раскрытых пунктов:

```tsx
<Accordion multiple defaultValue={['install', 'theme']}>
  <Accordion.Item value="install">
    <Accordion.Trigger>Установка</Accordion.Trigger>
    <Accordion.Panel>Инструкция по установке.</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="theme">
    <Accordion.Trigger>Тема</Accordion.Trigger>
    <Accordion.Panel>Настройка токенов.</Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

Для управляемого режима передайте `value` и `onValueChange`; `value` — `string | null` либо `string[]` при `multiple`. С `defaultValue` этот режим не смешивается:

```tsx
import { useState } from 'react';
import { Accordion } from '@dreadnought/ui/react';

function Example() {
  const [open, setOpen] = useState<string | null>(null);
  return <Accordion value={open} onValueChange={setOpen}>
    <Accordion.Item value="answer">
      <Accordion.Trigger>Вопрос</Accordion.Trigger>
      <Accordion.Panel>Ответ.</Accordion.Panel>
    </Accordion.Item>
  </Accordion>;
}
```

`Trigger` — настоящая кнопка в заголовке. Выбирайте `headingLevel={1}`–`{6}` согласно структуре страницы (по умолчанию `3`). `disabled` блокирует раскрытие. Enter/Space работают как у обычной кнопки; стрелки не перехватываются. Панель остаётся в DOM с `hidden`, сохраняя локальное состояние. Если для небольшого набора панелей нужны landmark-области, явно передайте `role="region"` в `Panel`.

Готовый `Accordion` подключает оформление из `@dreadnought/ui/react`. Глобальные токены задают основу, `--dreadnought-accordion-*` — значения всего семейства, а токены через `className` конкретной части меняют только её. Например:

```css
.specialItem {
  --dreadnought-accordion-bg: var(--dreadnought-color-surface-subtle);
}
```

Каждая часть (`Accordion`, `Item`, `Trigger`, `Panel`) принимает свой `className` и `ref`. Для собственной разметки без готовых стилей используйте `AccordionAdapter` из `@dreadnought/react/unstyled`. Этот импорт не подключает тему или CSS; декоративного индикатора в адаптере нет.

```tsx
import { AccordionAdapter } from '@dreadnought/react/unstyled';

<AccordionAdapter>
  <AccordionAdapter.Item value="custom">
    <AccordionAdapter.Trigger>Свой дизайн</AccordionAdapter.Trigger>
    <AccordionAdapter.Panel>Свой контент</AccordionAdapter.Panel>
  </AccordionAdapter.Item>
</AccordionAdapter>;
```

Если нужны только части логики, `useAccordion` из `@dreadnought/react/logic` управляет состоянием, а `toggleAccordionValue` из `@dreadnought/core` переключает строку или массив без React. Хук не создаёт DOM и стили; структуру, ARIA и клавиатурное поведение в этом случае необходимо обеспечить самостоятельно.

```ts
import { toggleAccordionValue } from '@dreadnought/core';

const next = toggleAccordionValue(null, 'install'); // 'install'
```
