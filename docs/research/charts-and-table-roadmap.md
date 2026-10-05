# Строительные блоки графиков и Table: предложение по реализации

Дата: **5 октября 2026**. Это исследовательский roadmap; **все новые API ниже — предложения**, требующие согласования при реализации. Код и зависимости не изменены. Основания, версии и проверенные источники: [AntV charts][Charts], [Ant Design Table][Table]. Локальный снимок: HEAD `7d10b6f714c50f6b1ba3045d0315e7b570d64d99` плюс текущее рабочее дерево.

## 1. Как выбирать работу

Цель — дать разработчику самостоятельные модели и небольшие компоненты. [Conventions][Conventions], [architecture][Architecture] и [core capabilities][Capabilities] задают границы: core не знает React/DOM/CSS; адаптер владеет состоянием, событиями, focus и измерением DOM; UI владеет оформлением и темами. Предметная геометрия не должна попадать в общие behaviors.

Применён Ponytail: использовать существующие `sortTableRows`, `filterTableRows`, `paginateTableRows`, selection и native HTML/SVG прежде новой зависимости; не создавать заранее универсальный chart engine, grid state machine или provider на все случаи. Новых сравнительных прогонов нет; обещаний экономии времени, токенов, bundle size и скорости нет.

Предложение по графикам **условное**: собственный SVG Radar подходит первому компактному сценарию с явными domains; G2 стоит подключать, когда нужен конкретный более сложный график, brush или композиция. Отчёт сравнивает варианты до этого вывода. Если главный первый сценарий — line + zoom по времени, порядок Radar/G2 нужно поменять. Table развивается независимо; AntV S2 не нужен для её ближайших задач.

## 2. Карта ответственности

| Обязанность | Место | Переиспользование |
| --- | --- | --- |
| Общий select/toggle ключа | существующий core/behaviors | `getSelectionValue`; прочитан текущий working-tree контракт, не переносить незакоммиченные изменения автоматически |
| Сортировка, фильтры, pagination, будущий span plan | core/components/DataDisplay/Table либо отдельный предметный domain при реальной совместной потребности | существующие три функции; не вводить новый общий pipeline лишь ради последовательности трёх вызовов |
| Radar normalization и геометрия | core/domains/charts при добавлении первой модели | чистые типы и координаты, без SVG path/React/цветов |
| Controlled state, callbacks, checkbox indeterminate, refs, resize, scroll | adapters/react | существующие CheckboxAdapter, RadioGroup useId и ResizeObserver patterns; native DOM API |
| SVG/Canvas lifecycle, renderer events, keyboard legend | adapters/react | SVG DOM; G2 в отдельном opt-in модуле при доказанной необходимости |
| CSS Modules, scoped темы, renderer paint bridge | ui/presentation + тонкий ui/react фасад + themes | существующая карта presentation classes и conventions |
| Запросы сервера, редактируемые бизнес-данные, итог revenue | приложение | Table сообщает намерение/рендерит; не знает fetch URL или бизнес-формулу |

Пути новых файлов предварительные. Не создавать пустые domains/registry/hooks «на будущее». Для каждой задачи ниже можно собрать custom UI поверх чистой модели или unstyled adapter.

## 3. Этап A — исправить контракт уже существующей Table

### T1. Устойчивые ключи и предсказуемое состояние

**Сценарий:** пользователь сортирует записи, выбирает строку, затем фильтрует таблицу на последней странице; callback должен относиться к той же записи и валидной странице.

**Слой и reuse:** core Table helpers остаются чистыми; React adapter нормализует state/controlled requests. Использовать существующие helpers, не новый framework state manager. Доказательства проблемы: [Table report §4][Table], [recordKey][D-utils], [DataTableAdapter][D-data].

**Минимальный контракт:** требовать стабильный `rowKey` или валидный `record.key` для интерактивного режима; отказаться от неоднозначного index fallback. `filteredValue=null` предложено считать пустым controlled фильтром. `current/pageSize` — положительные целые finite; defaults только при инициализации. Сортировка сохраняет страницу, filter запрашивает1, изменение pageSize запрашивает1; уменьшение данных нормализует текущую страницу. Добавить `extra.action: 'sort'|'filter'|'paginate'`. Это изменения поведения: проверить совместимость `0.1.0`, предупреждения/миграцию, а не молча переписать contract.

```tsx
<TableAdapter rowKey="id" columns={columns} dataSource={users}
  pagination={{ current: page, pageSize: 20 }}
  onChange={(next, filters, sorter, { action }) => {
    setPage(next.current); // запрос; controlled DOM ждёт props
  }} />
```

**Зависимости:** нет новых пакетов; договориться о breaking policy и едином порядке `pagination.onChange`/Table.onChange, без двойного события. **Границы:** duplicate/missing keys, равные sort values, null/default filters, negative/NaN/fractional page, пустой массив, уменьшение total, controlled props не обновились. Не запускать callback во время render.

**Готовность:** targeted core тест стабильности и отсутствия мутации; adapter regression `[B,A]→sort→select A` получает A; filter со страницы3 сообщает1, controlled DOM остаётся на предоставленной странице до обновления; valid defaults не переинициализируются; события однозначны. Обновлены каталог/документация конкретных правил при будущей реализации.

### T2. Выбор страницы и независимость экземпляров

**Сценарий:** пользователь выбирает часть enabled строк; header показывает промежуточное состояние; две radio Table на странице не влияют друг на друга.

**Слой/reuse:** общие действия — существующий [getSelectionValue][Selection]; конкретный selectable page набор — Table; [CheckboxAdapter][Checkbox] уже ставит DOM indeterminate, [RadioGroupAdapter][Radio] уже использует useId. Переиспользовать подходящий adapter либо его предусмотренный контракт, без импорта готового UI в L2.

**Минимальный контракт:** сохранить `rowSelection.selectedRowKeys/onChange`. По умолчанию выбирать enabled строки текущей страницы; all-checkbox disabled при пустом selectable наборе, mixed при частичном выборе. Ключи вне текущих данных сохраняются; callback rows по первому этапу явно означает **доступные записи из текущего dataSource**, а не полный object cache. Radio/filter группы имеют уникальные имена на экземпляр. Нового preserveRecords prop пока не вводить.

```tsx
<TableAdapter rowKey="id" columns={columns} dataSource={pageRows}
  rowSelection={{ selectedRowKeys: keys,
    getCheckboxProps: row => ({ disabled: row.locked }),
    onChange: (nextKeys, availableRows) => setKeys(nextKeys) }} />
```

**Зависимости:** T1; проверить точный selection working-tree API при реализации. **Границы:** all-disabled/empty, выбранные disabled строки, смена server page, удалённая запись, controlled keys, два одинаковых column.key в разных фильтрах. Select-all не должен снимать выбор другой страницы.

**Готовность:** mixed DOM property/aria-checked, disabled empty header, сохранение off-page keys, точные доступные rows, независимые radio instances и filter menus проверены. Полный cache records — отдельная задача только при сценарии массовой операции с объектами.

### T3. Unstyled Table, fixed widths и границы UI

**Сценарий:** потребитель строит собственную тему; Table работает без UI CSS, а sticky колонки не перекрываются после изменения ширины контейнера.

**Слой/reuse:** адаптер измеряет фактические widths через native ResizeObserver/ref и рассчитывает offsets; UI оформляет/задаёт размеры. Сейчас L2 зависит от `--dreadnought-table-selection-width`, глобальное правило UI затрагивает adapter pagination [Table report §4.4][Table]. Использовать [существующий ResizeObserver pattern][ResizePattern] как образец lifecycle, не переносить textarea hook в Table.

**Минимальный контракт:** сначала оставить `columns.width`, `fixed:'left'|'right'`, `sticky:{offsetHeader}`, `scroll:{x,y}`. Явно документировать поддержанный контейнер: внутренний scroll wrapper; внешний произвольный getContainer пока не добавлять. Measured widths и selection offset — внутренние adapter числа; UI CSS под локальным class. Если потребуется внешний wrapper ref/scroll handler, отдельное минимальное `containerProps`, не переопределять native table onScroll.

```tsx
<TableAdapter rowKey="id" columns={fixedColumns} dataSource={users}
  sticky={{ offsetHeader: 48 }} scroll={{ x: 900, y: 320 }} />
```

**Зависимости:** T1/T2 для selection column; без новых пакетов. **Границы:** missing widths, font load, container resize без window resize, скрытие/show контейнера, scrollbar, длинная строка, RTL (сначала явно не поддержан, пока не проверен), nested overflow. Измерения не импортируют theme tokens, core не трогает document.

**Готовность:** browser tests actual rectangles/scroll показывают отсутствие перекрытий fixed колонок с selection; resize sidebar пересчитывает offsets; observer disconnect на unmount; два scoped themes; общий импорт UI CSS не меняет computed styles unstyled pagination. DOM-only inline-style test недостаточен.

## 4. Этап B — первый график как самостоятельная модель

### C1. Чистая Radar-модель

**Сценарий:** сравнить варианты по качеству, покрытию и задержке с разными единицами; использовать координаты в React или другом renderer.

**Слой/reuse:** предметный core/domain charts; native Math; не общий behavior и не зависимость от G2. Полный сквозной пример и формулы — [Charts §6][Charts].

**Минимальный контракт:** `buildRadarLayout({metrics,series,radius}) → {axes,seriesPoints}`; metric `{id,label,domain:[min,max],reverse?}`, series `{id,label,values:Record<metricId,number>}`. Output — IDs, angles, x/y, original/normalized value. Ни цветов, ни SVG path. Порядок axes задан metrics. Missing/out-of-domain значения первого contract вызывают явную ошибку; никаких silent zeros или неявного clipping.

```ts
const model = buildRadarLayout({
  metrics: [
    { id: 'quality', label: 'Качество', domain: [0, 100] },
    { id: 'coverage', label: 'Покрытие', domain: [0, 100] },
    { id: 'latency', label: 'Задержка, мс', domain: [0, 200], reverse: true },
  ],
  series: [{ id: 'a', label: 'A', values: { quality: 80, coverage: 70, latency: 60 } }],
  radius: 100,
});
```

**Зависимости:** никаких, можно параллельно этапу A в смысле независимости задач. **Границы:** минимум3 metrics, unique metric/series IDs, finite values/radius, domain min<max, radius>0, reverse, пустые series. Не сравнивать площадь polygon как самостоятельный рейтинг.

**Готовность:** аналитически известные координаты при3/4 axes, reverse и диапазонах вне0..1; deterministic ordering, immutable inputs, explicit invalid cases; пример custom renderer импортирует только core. Перед экспортом проверить naming/public package conventions.

### C2. Unstyled SVG Radar и доступное взаимодействие

**Статус:** реализован `RadarChartAdapter` второго слоя, публичный каталог/MCP и страница `/components/radarchart/`. Готовое оформление реализовано отдельно в C3. Контракт адаптера: [спецификация C2](../superpowers/specs/2026-10-05-radar-svg-adapter-design.md).

**Сценарий:** в браузере менять видимость серий через клавиатуру, читать значения без hover, изменять контейнер sidebar.

**Слой/reuse:** React adapter создаёт SVG из C1 и HTML legend, состояние/handlers/focus. Использовать selection для visibleSeries; native SVG/ResizeObserver. Геометрия готова из core, DOM measurement только здесь. Подробное значение можно отдать существующей compound Table; UI не обязателен.

**Контракт:** `RadarChartAdapter({metrics,series,width?,height?,visibleSeries?,defaultVisibleSeries?,onVisibleSeriesChange?,label,description?,labels?,slotProps?})`; фиксированные размеры задаются вместе, иначе ResizeObserver измеряет ширину отдельного plot-контейнера, высота равна 80% ширины. Без observer SVG отсутствует, но легенда и полная таблица доступны. SVG декоративный, legend buttons нативные с aria-pressed. Root настраивается нативными figure props, части — slotProps; составного публичного API нет. Длинные SVG-подписи могут пересекаться, полные подписи и значения остаются в таблице.

```tsx
<RadarChartAdapter label="Сравнение вариантов"
  metrics={metrics} series={series} width={400} height={320}
  visibleSeries={visible} onVisibleSeriesChange={setVisible} />
```

**Зависимости:** C1; проверенный selection, существующая native Table. **Границы:** все series скрыты, controlled state не обновлён, long labels, одинаковые IDs, hidden0×0 container, SSR без DOM, StrictMode remount. Tooltip может дополнять описание, но не заменяет доступные значения.

**Готовность:** keyboard legend работает без mouse; values/units/reverse понятны через DOM; resize без window event; cleanup observer; fixed-size SSR выдаёт SVG/описание без document; measured SSR имеет стабильный placeholder без hydration mismatch. Не обещать grid navigation точек или полный screen-reader coverage без проверки.

### C3. Оформление Radar и scoped themes

**Статус:** реализован `RadarChart` в `@dreadnought/ui/react`; framework-neutral `radarChartPresentation` и `getRadarSeriesClass` экспортируются из `@dreadnought/ui`. Геометрия/состояние остаются в C1/C2. Компонентные токены в `Visualization/RadarChart` ссылаются на глобальные роли, данные оформления назначаются детерминированно по ID. Шесть сочетаний могут повторяться: уникальность каждого цвета для произвольного набора не обещается. Названия серий и полная таблица не зависят от цвета. Локальные области переопределяют компонентные токены; новый theme-provider или `data-theme` API не добавлен. Storybook показывает готовый компонент, отдельный адаптер, фиксированный размер, две одновременно оформленные области и восемь серий. Анимации нет; forced-colors сохраняет контуры и рисунок линий. Длинные SVG-подписи по-прежнему могут пересекаться, полный текст доступен в таблице.

**Сценарий:** готовый Radar вписывается в Dreadnought, custom adapter остаётся независимым; две темы одновременно дают разные цвета.

**Слой/reuse:** ui/presentation CSS Module + React facade; themes. Переиспользовать существующий [Table UI/presentation подход][D-ui], размерные/цветовые global roles. Не импортировать React в presentation map.

**Минимальный контракт:** `RadarChart` повторяет поведенческие props C2; UI даёт классы root/grid/axis/series/legend/focus. Стабильное назначение цветов по series ID на lifetime набора; доступный text/legend не кодирует series одним цветом. Не экспортировать имена внутренних CSS классов как обязательное API.

```tsx
<div className="customRadarTheme">
  <RadarChart label="Сравнение" metrics={metrics} series={series} />
</div>
```

`customRadarTheme` — класс приложения, задающий `--dreadnought-radar-chart-*`; не новый API выбора темы. Например, `--dreadnought-radar-chart-series-1-color: var(--dreadnought-color-chart-series-1-on-light)`. Для оформления вложенной таблицы используются уже существующие `--dreadnought-table-*`. Значения наследуются только внутри этой области.

**Зависимости:** C2; согласование roles/tokens. **Границы:** dark/light/forced colors, contrast, reduced motion (первый выпуск без обязательной анимации), many series, перенос labels. Размерные component tokens ссылаются на global tokens.

**Готовность:** scoped themes, focus visible, узнаваемая серия после скрытия другой; unstyled adapter при общем UI stylesheet не меняет внешний вид; presentation импортируем без React; Storybook custom/core-only и UI примеры показывают разные сборки.

## 5. Этап C — расширения Table по отдельным сценариям

### T4. Серверная страница и loading

**Сценарий:** backend возвращает20 из5000 записей, пользователь меняет фильтр; Table не нарезает эту страницу повторно.

**Слой/reuse:** adapter переключает local/manual обработку, status/aria-busy; UI оформляет loading. Core helpers остаются доступными в local режиме; приложение выполняет запрос и отменяет устаревшие ответы.

**Минимальный контракт:** один `processing:'local'|'manual'` (default local), `pagination.total`, `loading:boolean`, `extra.action` из T1. В manual режиме dataSource уже представляет страницу; sort/filter UI только сообщает запрос, Table не преобразует dataSource. `total` обязателен для включённой manual pagination. Если mixed режим станет нужен, сначала сценарий, потом per-operation switches.

```tsx
<TableAdapter rowKey="id" processing="manual" dataSource={response.rows}
  columns={serverColumns} loading={pending}
  pagination={{ current: page, pageSize: 20, total: response.total }}
  onChange={requestPage} />
```

**Зависимости:** T1/T2; sorter intent без comparator требует минимального флага в колонке, например `sortable:true`; не считать нынешнюю функцию comparator серверным протоколом. **Границы:** total0, last page removed, response races, missing selected records, retry/error живёт в приложении, server sort null. **Готовность:** принятая страница2 отображает все20 записей, no local slice/filter; callbacks не fetch сами; loading объявлен и не теряет focus; controlled filter→page1; keys сохраняются согласно T2.

### T5. Настройка строк/ячеек, spans и summary

**Сценарий:** объединить повторяющиеся категории в небольшом отчёте, выделить ошибочную строку и показать бизнес-итог.

**Слой/reuse:** adapter native table attrs; UI стили частей. Сначала consumer задаёт spans; отдельный чистый core span helper добавлять только когда два сценария требуют одной вычисляемой операции. Итог считает приложение. Использовать compound Table.Cell/native td, не новый renderer abstraction.

**Минимальный контракт:** `onRow(record,index)`, column `onCell(record,index)` ограниченные DOM props; `rowSpan/colSpan=0` скрывают cell; `summary(rows)` render slot под tfoot. Обработчики compose с внутренними, не перетирают selection/focus без определения политики. Grouped columns — отдельная следующая задача, не обязательна для этого шага.

```tsx
<TableAdapter rowKey="id" dataSource={rows}
  columns={[{ key: 'group', title: 'Группа', dataIndex: 'group',
    onCell: (_row, i) => ({ rowSpan: spans[i] }) }]}
  summary={pageRows => <TableAdapter.Row>
    <TableAdapter.Cell>Итого: {sum(pageRows)}</TableAdapter.Cell>
  </TableAdapter.Row>} />
```

**Зависимости:** T1/T3; окончательно определить summary input (предложено видимые pageRows, не весь filtered source). **Границы:** spans через границу страницы запрещены первым контрактом; fixed column boundary, selection column, empty colspan, custom class/handler, summary merged cells. **Готовность:** корректные native th/td spans и скрытые0, tfoot structure, сохранение event/ref; примеры без UI; fixed+merged не объявлять готовым до browser geometry test. Virtual здесь отсутствует.

### T6. Несколько сортировок и группы/скрытие колонок

Это **две независимые небольшие задачи**, объединены здесь лишь по приоритету после T1–T5.

**Сценарии:** (a) сортировать сначала статус, затем имя; (b) сгруппировать финансовые поля и скрыть часть колонок на маленьком экране.

**Слой/reuse:** (a) чистая последовательность comparators в core + adapter sort state; (b) чистая column tree/header plan без React titles в core, DOM th scope/colSpan в adapter, UI styles. Существующую stable single sort не менять на нестабильную. Responsive сначала controlled columns извне; не создавать breakpoint service заранее.

**Минимальные контракты:** (a) новый `sortTableRowsBy(rows, [{compare,order}])`, порядок массива — явный приоритет; `onChange` multi sorter отдельного opt-in API, не внезапная union в старом callback. (b) `TableColumnGroup {key,title,children}`, leaf `hidden?:boolean`; скрытая sort/filter политика явно выбранная, предложено сохранить state, чтобы видимость не меняла запрос автоматически.

```ts
sortTableRowsBy(users, [
  { compare: byStatus, order: 'ascend' },
  { compare: byName, order: 'ascend' },
]);
const columns = [{ key: 'finance', title: 'Финансы', children: [amount, tax] }];
```

**Зависимости:** (a) T1 и сценарий multi; (b) T3/T5 для layout, первая версия без virtual. **Границы:** равные comparators, unknown column keys, все листья скрыты, mixed fixed группы, dynamic title, accessibility headers association. **Готовность:** (a) stable ties/clear cycle и controlled priorities; (b) корректные col/colgroup header relationships, spans/width после hidden, правило сохранённого sort подтверждено. Если нужны сложные multi-level headers, проверить `headers/id`, а не только `scope=col`.

### T7. Раскрываемые подробности; дерево отдельным шагом

**Сценарий:** посмотреть подробности заказа без перехода; затем, только если требуется, раскрывать иерархические записи.

**Слой/reuse:** core selection-like keys для expansion, adapter button/aria-expanded/aria-controls и detail row, UI отступы. Для detail достаточно stable IDs и existing Table cells; не импортировать tree conduction.

**Минимальный контракт первой задачи:** `expandedRowKeys/defaultExpandedRowKeys/onExpandedRowsChange`, `renderExpandedRow(record)`, `rowExpandable?`. Следующая отдельная tree задача: `getChildren(record)`, visible row model `{key,record,depth,parentKey}`, expansion keys. Tree selection по умолчанию независима; propagation — только после отдельного сценария.

```tsx
<TableAdapter rowKey="id" columns={columns} dataSource={orders}
  expandedRowKeys={expanded} onExpandedRowsChange={setExpanded}
  renderExpandedRow={order => <OrderDetails order={order} />} />
```

**Зависимости:** T1/T5; tree также требует решения, что пагинируется: roots или visible nodes (первый contract предложено roots). **Границы:** nested keys, recursive cycles для tree, deleted expanded row, disabled expansion, colspan с selection, fixed details, unmount drafts. **Готовность:** keyboard toggle/native semantics, exact keys callback, controlled wait, правильный colspan; tree только после flatten/order/cycle tests. Detail+tree не обещать одновременно; RC также имеет явное различие режимов.

## 6. Этап D — только при подтверждённой потребности

### C4. Узкая интеграция G2 для time-series с brush

**Сценарий:** line по времени с несколькими сериями, shared tooltip и выбором диапазона, который передаётся внешней Table. Так появляется потребность, покрываемая существующим движком.

**Слой/reuse:** G2 отвечает за scales/layout/marks/interactions/render; adapter за mount/update/destroy/resize/event mapping, UI за paint bridge из scoped tokens. Core имеет наш data/domain contract, не импортирует G2/React. Opt-in module не должен загружаться при импорте Button или собственного Radar. Пакет/лицензии и SSR ограничения — [Charts §4–7][Charts].

**Минимальный контракт:** сначала один `TimeSeriesChartAdapter` с rows `{time:number,value:number,seriesId:string}`, явные xDomain/yDomain, `range/onRangeChange`. Не универсальный `engine:any` и не весь G2 spec в собственном core. Selection range — domain данные, не pixel rect. UI передаёт resolved paint; чтение computed CSS vars только в UI/framework bridge, без React в общей presentation части.

```tsx
<TimeSeriesChartAdapter data={measurements} xDomain={[from, to]}
  yDomain={[0, 100]} range={range} onRangeChange={setRange}
  label="Измерения во времени" />
```

**Зависимости:** реальный scenario, выбор Canvas/SVG, прямой G2 dependency и проверка будущего lockfile MIT notices/peers. **Границы:** sorted/unsorted timestamps, duplicate/missing points, timezone formatting, zero range, controlled brush loops, resize контейнера (G2 autoFit слушает window), StrictMode, import только клиента, racing render updates. Большие данные — определить реальный объём до decimation, не обещать unlimited.

**Готовность:** mounted chart обновляется без дублирования listeners, destroy на unmount, resize контейнера, стабильные callbacks ranges, доступная DOM альтернатива/keyboard range controls, two themed scopes, SSR placeholder без DOM import; подтверждённое отсутствие G2 в обычном entry dependency graph/build output. Численный размер bundle проверять при реализации, сейчас его оценки нет.

### T8. Виртуализация как отдельный выбор Table/Grid

**Сценарий:** приложение реально испытывает задержки с большим числом строк. Пока количественного порога и воспроизведения нет, задача условная и не ближайшая.

**Слой/reuse:** adapter windowing/DOM measurements/focus lifetime; core только visible row model/range arithmetic при нужде. Сравнить существующий virtual-list/RC integration с ограниченной собственной windowing моделью на реальном сценарии; не писать сложный virtual engine заранее. Измерения в рамках будущей реализации — отдельное решение, это исследование не запускает сравнений.

**Минимальный первый контракт:** отдельный opt-in `VirtualTableAdapter` для **плоских строк фиксированной высоты**, numeric viewport, без expandable/tree/merged; или отдельный Grid при необходимости cell keyboard model. Имя/семантику выбирать после DOM prototype. Не добавлять `virtual:true` с обещанием всех сочетаний.

```tsx
<VirtualTableAdapter rowKey="id" columns={columns} dataSource={rows}
  viewport={{ width: 900, height: 400 }} rowHeight={36} />
```

**Зависимости:** T1–T3, подтверждённый объём/профиль, лицензии конкретного пакета. **Границы:** переменная высота не поддержана первым contract; scroll-to/focus retention, selection offscreen, screen reader, fixed и sticky отдельные gates. Expand/tree/merged добавлять каждый после собственного combinations test, не наследовать рекламную формулировку Ant Design.

**Готовность:** bounded rendered rows, correct scroll/selection/resize, offscreen focus policy, документированная DOM semantics, ref cleanup; отдельные browser gates для каждого разрешённого сочетания. Нет обещания HTML table semantics, если тело реализовано div; нет role=grid без keyboard behavior. Старый native Table остаётся самостоятельным публичным компонентом.

## 7. Ближайшие пять задач и порядок

1. **T1 — ключи и state.** Исправляет идентичность callback и controlled edges существующего API; prerequisite для любых новых возможностей Table.
2. **T2 — selection.** Закрывает недостающее mixed/disabled состояние и коллизии экземпляров; использует уже имеющиеся Checkbox/Radio/selection blocks.
3. **T3 — unstyled и fixed.** Восстанавливает границу L2/L3 и проверяет реальную геометрию, прежде чем добавлять новые layout комбинации.
4. **C1 — чистый Radar.** Даёт самостоятельную предметную модель без renderer dependency; может выполняться независимо от первых трёх.
5. **C2 — SVG Radar adapter.** Завершает сценарий данными, доступным DOM и lifecycle; после него C3 добавляет готовое оформление.

После этого выбирать **T4**, если приложение уже использует server pages, или **T5**, если требуется отчёт с merged/summary. C4 и T8 не являются обязательной частью первой поставки. Не переносить весь список сразу в sprint.

## 8. Открытые вопросы

### Radar: интерактивные вершины и независимый Tooltip

Реализовано: каждая видимая вершина подсвечивается при наведении и фокусе; Tooltip показывает серию, показатель и исходное значение. Escape закрывает подсказку. Полная таблица остаётся доступной независимо от видимости серий. Tooltip выделен в Overlays во всех трёх слоях и использует общий механизм anchored popover, без нового chart provider.

Количество осей задаётся массивом metrics (не меньше трёх); Storybook содержит примеры с 4, 5 и 6 осями. slotProps.point(series, metric) и slotProps.tooltip позволяют настраивать части без DOM-селекторов по вложенности.

- Какой первый реальный chart: Radar-сравнение или time-series/brush? От этого зависит необходимость G2.
- Допустим ли явный отказ от index keys/изменение null/default поведения до стабилизации `0.1.0`? Как описать migration?
- Нужны только selected keys или объекты удалённых/server записей? Кто владеет record cache и его очисткой?
- Нужны внешние scroll containers/RTL сейчас? Первые geometry gates должны соответствовать фактическим сценариям.
- Summary относится к странице, filtered local data или server totals? Бизнес-итоги лучше передавать явно.
- Для дерева пагинируются roots или flattened visible nodes? Нужны ли связанный выбор и сохранение раскрытия при фильтре?
- Виртуальная поверхность остаётся read-only таблицей или становится grid с active cell/editing? Это разные accessibility contracts.
- Нужен ли SSR самого графика или достаточно placeholder/таблицы значений? Canvas screenshot не равно interactive SSR.

## 9. Что сознательно не переносить сейчас

- Весь AntV, G6/X6/L7/S2/mobile stack: другие предметные задачи.
- G2Plot как новую основу для G2 5: у него линия G2 4; готовые React plots и G2 рассматриваются отдельно.
- Все Ant Design props/внутренние hooks в один Table и произвольные virtual+tree+expand+merged комбинации.
- Общий chart DSL/provider/plugin registry ради одного Radar; общие behaviors для вычислений radar/табличных spans.
- Бизнес editing engine, backend fetch, формулы summary и неограниченный selected-record cache внутри core.
- Grid keyboard модель под видом обычной native Table; доступность «автоматически», только потому что выбран SVG или a11y plugin.
- Decimation, worker/WebGL и animation framework без подтверждённой потребности.

Все задачи сформулированы как проверяемые небольшие изменения. До реализации нужны выбранный сценарий и согласование его контракта; это не повод создавать заранее неиспользуемые расширения.

## Локальные источники

[Charts]: /C:/Users/vladi/Desktop/gg/study/4course/docs/research/antv-charts-analysis.md
[Table]: /C:/Users/vladi/Desktop/gg/study/4course/docs/research/antd-table-analysis.md
[Conventions]: /C:/Users/vladi/Desktop/gg/study/4course/docs/conventions.md
[Architecture]: /C:/Users/vladi/Desktop/gg/study/4course/docs/architecture.md
[Capabilities]: /C:/Users/vladi/Desktop/gg/study/4course/docs/core-capabilities.md
[D-utils]: /C:/Users/vladi/Desktop/gg/study/4course/packages/adapters/react/src/DataDisplay/Table/tableData.ts
[D-data]: /C:/Users/vladi/Desktop/gg/study/4course/packages/adapters/react/src/DataDisplay/Table/DataTableAdapter.tsx
[D-ui]: /C:/Users/vladi/Desktop/gg/study/4course/packages/ui/src/adapters/react/components/DataDisplay/Table/Table.tsx
[Selection]: /C:/Users/vladi/Desktop/gg/study/4course/packages/core/src/behaviors/getSelectionValue.ts
[Checkbox]: /C:/Users/vladi/Desktop/gg/study/4course/packages/adapters/react/src/Fields/Checkbox/CheckboxAdapter.tsx
[Radio]: /C:/Users/vladi/Desktop/gg/study/4course/packages/adapters/react/src/Fields/Radio/RadioGroupAdapter.tsx
[ResizePattern]: /C:/Users/vladi/Desktop/gg/study/4course/packages/adapters/react/src/Fields/TextArea/useTextArea.ts
