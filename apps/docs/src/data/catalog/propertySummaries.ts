export const commonPropertySummaries: Record<string, string> = {
  children: 'Содержимое.',
  disabled: 'Отключает управление.',
  required: 'Обязательное поле.',
  ref: 'Ссылка на DOM-элемент управления.',
  form: 'ID связанной формы.',
  name: 'Имя поля при отправке формы.',
  invalid: 'Состояние ошибки поля.',
};

export const propertySummaries: Record<string, Record<string, string>> = {
  accordion: {
    children: 'Элементы Accordion.Item.',
    'Accordion.Item.children': 'Заголовок и панель элемента.',
    'Accordion.Trigger.children': 'Содержимое кнопки раскрытия.',
    'Accordion.Panel.mountPolicy':
      'eager — сразу; lazy — при первом открытии; unmount — удалять при закрытии.',
  },
  card: {
    slotClassNames: 'Классы отдельных зон карточки.',
  },
  codeblock: {
    copyIcons: 'Иконки копирования, успеха и ошибки.',
  },
  datepicker: {
    slotClassNames: 'Классы поля, календаря, его ячеек и сообщения об ошибке.',
    ref: 'Ссылка на input поля.',
  },
  dropdown: {
    menuProps: 'Свойства меню и его пунктов. preventDefault отменяет действие и закрытие.',
  },
  menu: {
    items: 'Пункты, подменю, группы и разделители. href создаёт ссылку.',
  },
  select: {
    placement: 'Положение списка: bottomLeft, bottomRight, topLeft или topRight.',
    autoAdjustOverflow: 'Меняет сторону и удерживает список в пределах экрана.',
    virtual: 'Виртуализация: true, false или { itemHeight, height, overscan }.',
    showSearch: 'Поиск и его настройки: поля, фильтр, сортировка и управляемая строка.',
    clearContent: 'Содержимое кнопки очистки.',
    clearLabel: 'Доступное имя кнопки очистки.',
    indicator: 'Индикатор раскрытия списка.',
    maxCount: 'Лимит выбора при multiple; не обрезает переданные значения.',
    maxTagCount: 'Число видимых меток; остальные показаны как +N.',
    multiple: 'Множественный выбор. Backspace в пустом поле удаляет последнюю метку.',
    options: 'Варианты и группы с уникальными value.',
    slotProps: 'Свойства поля, списка, вариантов, групп и меток.',
    tagRender: 'Рендерер метки: option и { disabled, removeLabel, onRemove }.',
  },
  tabs: {
    children: 'Вкладки Tabs.Tab и соответствующие панели Tabs.Panel.',
    orientation: 'horizontal — сверху; vertical — слева, с навигацией ↑↓.',
    'Tabs.Panel.mountPolicy':
      'eager — сразу; lazy — при первом открытии; unmount — удалять при закрытии.',
  },
  tooltip: {
    autoAdjustOverflow: 'Менять сторону и сдвигать подсказку, если она не помещается.',
    openDelay: 'Задержка наведения в мс; 0 — сразу. Клавиатурный фокус без задержки.',
  },
  table: {
    columns: 'Колонки: заголовок, поле данных, ширина, сортировка, фильтры и вложенные группы.',
    loading: 'Показывать Loader, сохраняя строки и фокус.',
    expandable: 'Детали строки через expandedRowRender; нужны устойчивые rowKey или record.key.',
    onChange:
      'Изменение сортировки, фильтров или страницы. extra.action сообщает причину, extra.sorters — цепочку сортировки.',
    pagination:
      'current/pageSize управляют страницей; defaultCurrent/defaultPageSize задают начало. false отключает пагинацию.',
    processing:
      'local обрабатывает весь набор данных. manual показывает готовую серверную страницу; запросы выполняет приложение.',
    rowSelection:
      'Выбор по устойчивым ключам. Чекбокс шапки выбирает доступные строки только текущей страницы.',
    slotProps: 'Настройки Tooltip, Loader, фильтров и отрисовки пагинации.',
    summary:
      'Итоги по строкам текущей страницы; без пагинации — по всем подходящим строкам. В manual получает переданные строки.',
    locale: 'Текст пустого состояния.',
    rowHoverable: 'Подсвечивать строку при наведении.',
  },
  markdowneditor: {
    allowClear: 'Показывать кнопку очистки Markdown.',
    clearLabel: 'Доступное имя кнопки очистки.',
    showCount: 'Показывать количество символов.',
    autoSize: 'Высота по содержимому в пределах minRows/maxRows.',
    defaultValue: 'Начальный Markdown в неуправляемом режиме.',
    invalid: 'Состояние ошибки.',
    minRows: 'Минимальная высота в строках.',
    maxRows: 'Максимальная высота в строках.',
    readOnly: 'Чтение без редактирования.',
    value: 'Markdown в управляемом режиме.',
    renderToolbar: 'Своя панель форматирования, истории, предпросмотра и загрузки.',
    uploadImage:
      'Загрузка изображения: (file, { signal }) → Promise<URL>. Обрабатывайте отмену через signal.',
  },
  timepicker: {
    defaultOpen: 'Открыть список времени при первом отображении.',
    slotClassNames: 'Классы поля, колонок времени, вариантов и сообщения об ошибке.',
    ref: 'Ссылка на input поля.',
  },
  treeselect: {
    defaultValue: 'Начальный выбор: ключ узла или массив ключей при множественном выборе.',
    slotClassNames: 'Классы поля, выбранных меток, дерева и всплывающего списка.',
    ref: 'Ссылка на input поля.',
  },
  upload: {
    slotClassNames: 'Классы зоны загрузки, списка файлов, действий и сообщений об отклонении.',
  },
};
