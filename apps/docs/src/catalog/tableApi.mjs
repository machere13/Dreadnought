import ts from 'typescript';
import { getExport } from '../../../../tools/catalog/src/compiler.mjs';

const descriptions = {
  TableColumn: {
    key: 'Уникальный ключ колонки.',
    title: 'Заголовок.',
    children: 'Вложенные колонки для группировки шапки.',
    hidden: 'Скрыть колонку или группу.',
    align: 'Выравнивание заголовка и ячеек.',
    ellipsis: 'Сокращать текст; полный текст доступен в Tooltip.',
    dataIndex: 'Поле записи или путь к вложенному значению.',
    render: 'Содержимое ячейки: значение, запись, индекс строки.',
    onCell: 'Нативные свойства ячейки, включая rowSpan и colSpan.',
    onHeaderCell: 'Нативные свойства ячейки шапки.',
    width: 'Ширина колонки в пикселях.',
    fixed: 'Закрепление слева или справа.',
    sorter: 'Сравнение строк; multiple задаёт приоритет сортировки.',
    sortOrder: 'Управляемое направление сортировки.',
    defaultSortOrder: 'Начальное направление сортировки.',
    sortLabel: 'Доступное имя кнопки сортировки.',
    filters: 'Варианты фильтра.',
    filterSearch: 'Поиск вариантов: встроенный или собственная функция.',
    filterDropdown: 'Собственная панель фильтра.',
    onFilter: 'Проверка записи для локальной фильтрации.',
    filteredValue: 'Управляемые значения фильтра; null очищает фильтр.',
    defaultFilteredValue: 'Начальные значения фильтра.',
    filterMultiple: 'Разрешить выбор нескольких значений.',
  },
  TablePagination: {
    total: 'Общее число записей; обязательно в manual.',
    current: 'Управляемый номер страницы, начиная с 1.',
    defaultCurrent: 'Начальный номер страницы.',
    pageSize: 'Управляемое число строк на странице.',
    defaultPageSize: 'Начальное число строк на странице.',
    onChange: 'Изменение страницы или её размера.',
  },
  TableRowSelection: {
    type: 'Множественный или одиночный выбор.',
    selectedRowKeys: 'Управляемые ключи выбранных строк.',
    defaultSelectedRowKeys: 'Начальные ключи выбранных строк.',
    onChange: 'Выбранные ключи и доступные записи.',
    getCheckboxProps: 'Отключение выбора конкретной строки.',
  },
  TableExpandable: {
    expandedRowRender: 'Содержимое раскрытой строки.',
    expandedRowKeys: 'Управляемые ключи раскрытых строк.',
    defaultExpandedRowKeys: 'Начальные ключи раскрытых строк.',
    rowExpandable: 'Разрешить раскрытие конкретной строки.',
    onExpand: 'Изменение раскрытия одной строки.',
    onExpandedRowsChange: 'Изменение списка раскрытых строк.',
    expandIcon: 'Содержимое кнопки раскрытия.',
    columnTitle: 'Заголовок колонки раскрытия.',
  },
  TableFilterDropdownProps: {
    selectedKeys: 'Черновик выбранных значений.',
    setSelectedKeys: 'Изменить черновик без применения.',
    confirm: 'Применить фильтр; closeDropdown=false оставляет панель открытой.',
    clearFilters: 'Очистить фильтр; confirm=false очищает только черновик.',
    close: 'Закрыть панель без применения черновика.',
  },
  TableFilterOption: {
    text: 'Название варианта.',
    value: 'Значение варианта.',
  },
  TableFilterSlots: {
    renderSearch: 'Поле поиска; сохраните переданные value и onChange.',
    renderButton: 'Кнопка панели; сохраните переданные type и onClick.',
    icon: 'Содержимое кнопки открытия фильтра.',
  },
};

export function tableApiGroups(context) {
  const { checker } = context;
  return Object.entries(descriptions).map(([title, meanings]) => {
    const symbol = getExport(context, '@dreadnought/ui/react', title);
    const type = checker.getDeclaredTypeOfSymbol(symbol);
    const rows = checker.getPropertiesOfType(type).map(property => {
      const declaration = property.valueDeclaration ?? property.declarations[0];
      const value = checker.getTypeOfSymbolAtLocation(property, declaration);
      const printed = checker.typeToString(value, undefined,
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
      return [property.name, printed.replace(/ \| undefined/g, ''), '—', meanings[property.name] ?? '—'];
    });
    return { title, rows };
  });
}
