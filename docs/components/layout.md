# Layout

Каркас страницы с шапкой, основной областью, подвалом и необязательной боковой панелью. Части доступны через составной API `Layout.Header`, `Layout.Content`, `Layout.Footer` и `Layout.Sidebar`. Внутри можно разместить любые компоненты приложения: логотип, меню и ссылки библиотека не подставляет.

```tsx
import { Layout } from '@dreadnought/ui/react';

<Layout>
  <Layout.Header>Логотип и действия</Layout.Header>
  <Layout direction="horizontal">
    <Layout.Sidebar aria-label="Разделы документации">
      <nav aria-label="Страницы">Ссылки проекта</nav>
    </Layout.Sidebar>
    <Layout.Content>Страница документации</Layout.Content>
  </Layout>
  <Layout.Footer>Ссылки и копирайт</Layout.Footer>
</Layout>;
```

Внешний `Layout` по умолчанию располагает части вертикально. Вложенный `direction="horizontal"` ставит Sidebar рядом с Content; порядок частей задаётся разметкой. `Header`, `Content`, `Footer`, `Sidebar` используют элементы `header`, `main`, `footer`, `aside`. Навигацию внутри Sidebar создайте отдельным `nav`.

Sidebar открыт по умолчанию. `defaultCollapsed` задаёт начальное состояние, а `collapsed` + `onCollapsedChange` позволяют управлять им извне:

```tsx
import { useState } from 'react';
import { Layout } from '@dreadnought/ui/react';

function DocumentationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return <Layout.Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} aria-label="Разделы">
    <nav aria-label="Документация">Ссылки проекта</nav>
  </Layout.Sidebar>;
}
```

Кнопка сворачивания остаётся доступной с клавиатуры; скрытое содержимое не размонтируется. В готовом компоненте у кнопки компактная иконка, а её полное доступное имя можно изменить через `expandLabel` и `collapseLabel`. Свою иконку передают через `triggerIcon`. Автоматического сворачивания на мобильном, встроенного меню и режима наложения в этой версии нет.

Для всей темы изменяйте токены `--dreadnought-layout-*`, для одного экземпляра — значения токенов через `className`. Отдельные части Sidebar доступны через `slotClassNames.body` и `slotClassNames.trigger`. Стили поставляет готовая точка входа; отдельные CSS-импорты не нужны.

Если нужна собственная разметка и оформление, используйте второй слой `@dreadnought/react/unstyled`: `LayoutAdapter` и отдельные `LayoutHeaderAdapter`, `LayoutContentAdapter`, `LayoutFooterAdapter`, `LayoutSidebarAdapter`. Они сохраняют семантику и сворачивание, но не подключают тему.
