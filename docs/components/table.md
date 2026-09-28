# Table

Таблица для структурированных данных. Сохраняет нативные теги и доступность: заголовкам колонок задавайте `scope="col"`, заголовкам строк — `scope="row"`.

```tsx
import { Table } from '@dreadnought/ui/react';

<Table>
  <Table.Head><Table.Row><Table.HeaderCell scope="col">Свойство</Table.HeaderCell></Table.Row></Table.Head>
  <Table.Body><Table.Row><Table.Cell>variant</Table.Cell></Table.Row></Table.Body>
</Table>;
```

Готовое оформление меняется токенами `--dreadnought-table-*`. Каждый слот принимает нативные свойства, `className` и `ref`. Для таблицы без библиотечных стилей используйте `TableAdapter` из `@dreadnought/react/unstyled` с теми же слотами. Горизонтальную прокрутку добавляйте контейнером вокруг таблицы там, где она нужна. Сортировку и пагинацию этот базовый компонент не делает.
