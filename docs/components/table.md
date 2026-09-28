# Table

Таблица для структурированных данных. Сохраняет нативные теги и доступность: заголовкам колонок задавайте `scope="col"`, заголовкам строк — `scope="row"`.

```tsx
import { Table } from '@dreadnought/ui/react';

<Table>
  <Table.Head><Table.Row><Table.HeaderCell scope="col">Свойство</Table.HeaderCell></Table.Row></Table.Head>
  <Table.Body><Table.Row><Table.Cell>variant</Table.Cell></Table.Row></Table.Body>
</Table>;
```

Для таблицы из массива данных доступны `columns`, `dataSource`, `rowKey`, `dataIndex` и `render`:

```tsx
<Table
  rowKey="id"
  columns={[{ key: 'name', title: 'Имя', dataIndex: 'name' }]}
  dataSource={[{ id: 1, name: 'Анна' }]}
/>;
```

Интерактивная таблица поддерживает сортировку (`sorter`), фильтры (`filters` + `onFilter`), пагинацию, выбор строк и закрепление шапки и столбцов:

```tsx
<Table
  rowKey="id"
  dataSource={people}
  pagination={{ pageSize: 10 }}
  rowSelection={{ onChange: (keys, rows) => console.log(keys, rows) }}
  sticky
  scroll={{ x: 900, y: 400 }}
  columns={[
    { key: 'name', title: 'Имя', dataIndex: 'name', width: 180, fixed: 'left' },
    { key: 'age', title: 'Возраст', dataIndex: 'age', sorter: (a, b) => a.age - b.age },
    { key: 'role', title: 'Роль', dataIndex: 'role', filters: [{ text: 'Дизайнер', value: 'designer' }], onFilter: (value, row) => row.role === value },
  ]}
/>;
```

`sticky={{ offsetHeader: 64 }}` задаёт отступ закреплённой шапки. Для `fixed: 'left' | 'right'` задавайте числовую `width` каждой закреплённой колонке: ширины используются для расчёта смещения, если закреплено несколько столбцов. `pagination={false}` показывает все строки. В `rowSelection` доступны `type: 'radio'`, управляемые `selectedRowKeys` и `getCheckboxProps` для отключения выбора отдельных строк. Пустое состояние настраивается через `locale.emptyText`.

Готовая таблица использует выделенную шапку и подсветку строки при наведении. `size="default" | "middle" | "small"` меняет плотность, `bordered` добавляет рамку и разделители колонок, `rowHoverable={false}` отключает подсветку. Оформление меняется токенами `--dreadnought-table-*`. Каждый слот принимает нативные свойства, `className` и `ref`. Для таблицы без библиотечных стилей используйте `TableAdapter` из `@dreadnought/react/unstyled` с теми же слотами.
