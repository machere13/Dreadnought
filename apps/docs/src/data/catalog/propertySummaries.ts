export const commonPropertySummaries: Record<string, string> = {
  children: 'Содержимое.',
  disabled: 'Отключает управление.',
  required: 'Обязательное поле.',
  ref: 'Ссылка на DOM-элемент управления.',
  form: 'ID связанной формы.',
  name: 'Имя поля при отправке формы.',
};

export const propertySummaries: Record<string, Record<string, string>> = {
  accordion: {
    'Accordion.Panel.mountPolicy': 'eager — сразу; lazy — при первом открытии; unmount — удалять при закрытии.',
  },
  card: {
    slotClassNames: 'Классы отдельных зон карточки.',
  },
  codeblock: {
    copyIcons: 'Иконки копирования, успеха и ошибки.',
  },
  dropdown: {
    menuProps: 'Свойства меню и его пунктов. preventDefault отменяет действие и закрытие.',
  },
  menu: {
    items: 'Пункты, подменю, группы и разделители. href создаёт ссылку.',
  },
  select: {
    showSearch: 'Поиск и его настройки: поля, фильтр, сортировка и управляемая строка.',
    searchable: 'Включает поиск, если showSearch не задан.',
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
    orientation: 'horizontal — сверху; vertical — слева, с навигацией ↑↓.',
    'Tabs.Panel.mountPolicy': 'eager — сразу; lazy — при первом открытии; unmount — удалять при закрытии.',
  },
  tooltip: {
    autoAdjustOverflow: 'Менять сторону и сдвигать подсказку, если она не помещается.',
    openDelay: 'Задержка наведения в мс; 0 — сразу. Клавиатурный фокус без задержки.',
  },
  table: {
    columns: 'Конфигурация колонок.',
    loading: 'Показывать Loader, сохраняя строки и фокус.',
    expandable: 'Раскрываемые строки.',
    onChange: 'Изменение сортировки, фильтров или страницы.',
    pagination: 'Пагинация; false отключает её.',
    processing: 'Локальная обработка данных или показ готовой серверной страницы.',
    rowSelection: 'Выбор строк по устойчивым ключам.',
    slotProps: 'Настройки Tooltip, Loader и элементов фильтра.',
    summary: 'Итоги по строкам текущей страницы.',
    locale: 'Текст пустого состояния.',
    rowHoverable: 'Подсвечивать строку при наведении.',
  },
  markdowneditor: {
    autoSize: 'Высота по содержимому в пределах minRows/maxRows.',
    defaultValue: 'Начальный Markdown в неуправляемом режиме.',
    invalid: 'Состояние ошибки.',
    minRows: 'Минимальная высота в строках.',
    maxRows: 'Максимальная высота в строках.',
    readOnly: 'Чтение без редактирования.',
    value: 'Markdown в управляемом режиме.',
    renderToolbar: 'Своя панель форматирования, истории, предпросмотра и загрузки.',
    uploadImage: 'Загрузка изображения из файла, буфера или перетаскивания.',
  },
};
