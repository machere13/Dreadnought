# SVG Radar Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution or superpowers:subagent-driven-development if the user chooses delegation. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Дать доступный неоформленный RadarChartAdapter второго слоя с SVG, выбором видимых серий и адаптивным viewport.

**Architecture:** Core C1 вычисляет все координаты с radius 100. React-адаптер создаёт SVG и семантическую HTML-разметку; небольшой локальный hook измеряет только ширину plot-контейнера. Каталог и документация поддерживают настоящий компонент без третьего слоя.

**Tech Stack:** React 19, TypeScript, native SVG/ResizeObserver, existing TableAdapter/getSelectionValue, Vitest/Testing Library, Astro, существующий каталог/MCP. Новых зависимостей нет.

**Spec:** `docs/superpowers/specs/2026-10-05-radar-svg-adapter-design.md` — прочитать полностью перед выполнением.

## Global Constraints

- Только C2: без готового RadarChart, темы, tooltip, анимации, G2, Canvas и сравнительных прогонов.
- Core C1 не изменять; hidden series также проходят его валидацию.
- Публичный импорт `@dreadnought/react/unstyled`; family `Visualization`, папка `Visualization/RadarChart`.
- SVG radius 100, viewBox `-140 -140 280 280`, preserveAspectRatio `xMidYMid meet`; сетка 25/50/75/100%.
- Фиксированные width/height — полная пара конечных положительных чисел; adaptive viewport 5:4.
- Только native button, без tab-stop на каждой точке; SVG aria-hidden, таблица не скрыта библиотекой.
- Нет CSS/цветов/толщин линии/шрифтов в адаптере; оформление демо принадлежит приложению документации.
- Ponytail; никаких комментариев в компонентах. `@ts-expect-error` допустим только в type-tests.
- Завершённые задачи коммитить локально в main, без push. Сохранять чужие изменения.

## Review Focus

1. Controlled callback мутирует полученный массив: это не меняет внутреннее состояние или входные массивы; DOM ждёт нового controlled-пропса.
2. Серия исчезла и появилась снова, включая ID `__proto__`/`constructor`: видимость связана с точным ID, callback содержит только актуальные ID.
3. Старый ResizeObserver callback после unmount/смены режима/StrictMode: не возвращает устаревший SVG и не обновляет неактивный экземпляр.
4. JavaScript slotProps пытается заменить points/viewBox/aria-pressed/type/children: обязательная геометрия и семантика остаются согласованными.
5. Компонент только L2: каталог/MCP и сайт не требуют фиктивных L1/L3 bindings или папки токенов; страницы прежних компонентов не регрессируют.

## Карта файлов и интерфейсов

Task 1 создаёт `packages/adapters/react/src/Visualization/RadarChart/radarChart.types.ts`, `RadarChartAdapter.tsx`, `RadarPlot.tsx`, `RadarDataTable.tsx`, `index.ts`; изменяет `src/index.ts`, `src/unstyled.ts`. Типы и корень находятся рядом с двумя короткими renderer-файлами; не выделять provider или универсальный hook выбора.

Тесты Task 1: `packages/adapters/react/tests/Visualization/RadarChart/RadarChartAdapter.test.tsx`, `RadarChartSSR.test.tsx`, `RadarChartAdapter.types.tsx`; type-test включить в `tsconfig.type-tests.json`.

Task 2 создаёт локальный `src/Visualization/RadarChart/useRadarViewport.ts`, добавляет `tests/Visualization/RadarChart/RadarViewport.test.tsx`, дополняет SSR-тест. Hook не экспортируется через logic: отдельного пользовательского контракта состояния у него нет.

Task 3 создаёт `src/Visualization/RadarChart/catalog.json`, `apps/docs/src/components/componentDocs/RadarChartDoc.tsx`, `apps/docs/src/pages/components/radarchart/index.astro`. Изменяет `tools/catalog/src/config.mjs`, `generateCatalog.mjs`, существующие catalog/MCP tests, `apps/docs/src/catalog/generateDocData.mjs`, `getCatalogDoc.ts`, `components/componentDocs/types.ts`, `components/DocsPage.tsx`, `DocsPage.module.css`, `apps/docs/tests/catalogDocs.test.ts`, `DocsPage.test.tsx`, `docs/core-capabilities.md`, `docs/research/charts-and-table-roadmap.md`.

## Task 1: фиксированный SVG, видимость и доступные данные

**Interfaces:** Consumes публичные `buildRadarLayout`, `RadarMetric`, `RadarSeries`, `RadarLayout`, `getSelectionValue` из core и существующий составной TableAdapter. Produces `RadarChartAdapter(props: RadarChartAdapterProps)`, `RadarPlot({layout,metrics,series,visible,slotProps,width,height})`, `RadarDataTable({metrics,series,label,labels,tableProps})`. Private renderer props определять рядом с renderer; не экспортировать их публично.

- [ ] **Step 1: RED геометрии и разметки.** Создать тест с импортом из `../../../src/unstyled.ts`, cleanup afterEach и frozen fixtures:

```tsx
const metrics = ['a','b','c','d'].map(id => ({id,label:id,domain:[0,100] as const}));
const series = [{id:'A',label:'Вариант A',values:{a:100,b:50,c:0,d:25}},
  {id:'B',label:'Вариант B',values:{a:50,b:50,c:50,d:50}}];
it('renders C1 coordinates, semantic data and native legend', () => {
  const {container} = render(<RadarChartAdapter label="Сравнение" metrics={metrics}
    series={series} width={400} height={320} />);
  const svg = container.querySelector('svg')!;
  expect(svg.getAttribute('viewBox')).toBe('-140 -140 280 280');
  expect(svg.getAttribute('aria-hidden')).toBe('true');
  expect(svg.getAttribute('width')).toBe('400');
  const polygon = container.querySelector('polygon[data-series-id="A"]')!;
  const points = polygon.getAttribute('points')!.trim().split(/\s+/).map(pair => pair.split(',').map(Number));
  expect(points[0][1]).toBeCloseTo(-100);
  expect(points[1][0]).toBeCloseTo(50);
  expect(points[3][0]).toBeCloseTo(-25);
  expect(screen.getByRole('button',{name:'Вариант A'}).getAttribute('type')).toBe('button');
  expect(screen.getByRole('table',{name:'Сравнение: Данные'})).toBeTruthy();
  expect(container.querySelectorAll('th[scope="row"]')).toHaveLength(4);
});
```

Run `node node_modules/vitest/vitest.mjs run packages/adapters/react/tests/Visualization/RadarChart/RadarChartAdapter.test.tsx --reporter=dot`. Expected RED: экспорт отсутствует. Затем stub компонента должен дать RED на assertions, не только разрешении импорта.

- [ ] **Step 2: публичные типы, fixed renderer и таблица.** В radarChart.types.ts определить:

```ts
type Native<Tag extends keyof React.JSX.IntrinsicElements, Owned extends string = never>
  = Omit<React.ComponentPropsWithRef<Tag>, Owned | 'children' | 'dangerouslySetInnerHTML'>;
type PerMetric<T> = (metric: RadarMetric) => T;
type PerSeries<T> = (series: RadarSeries) => T;
export type RadarChartLabels = {
  legend:string; dataTable:string; metric:string; domain:string; direction:string;
  increasing:string; decreasing:string;
};
export type RadarChartSlotProps = {
  plotContainer?: Native<'div'>;
  plot?: Native<'svg','width'|'height'|'viewBox'|'preserveAspectRatio'|'aria-hidden'|'tabIndex'|'focusable'>;
  grid?: Native<'g'>;
  axis?: PerMetric<Native<'line','x1'|'y1'|'x2'|'y2'>>;
  axisLabel?: PerMetric<Native<'text','x'|'y'|'textAnchor'>>;
  series?: PerSeries<Native<'polygon','points'>>;
  legend?: Native<'div','role'|'aria-label'>;
  legendButton?: PerSeries<Native<'button','type'|'aria-pressed'|'aria-label'|'aria-labelledby'|'disabled'>>;
  table?: Native<'table','aria-hidden'|'hidden'|'role'>;
};
type Size = {width:number;height:number} | {width?:undefined;height?:undefined};
export type RadarChartAdapterProps = Native<'figure','aria-labelledby'|'aria-describedby'|'role'> & Size & {
  metrics:readonly RadarMetric[]; series:readonly RadarSeries[]; label:string; description?:string;
  visibleSeries?:readonly string[]; defaultVisibleSeries?:readonly string[];
  onVisibleSeriesChange?:(next:string[])=>void;
  labels?:Partial<RadarChartLabels>; slotProps?:RadarChartSlotProps;
};
```

`Native` остаётся локальным utility этого файла, не новым shared API. Отдельно исключить управляемые data-ui/data-series-id в runtime-порядке spread. Неизвестные дополнительные TS data-атрибуты допускаются стандартными JSX-правилами, не требуют index signature.

В корне вызвать buildRadarLayout для всех входных серий с radius 100; проверить label/description/labels, размеры и массивы видимости до render. Labels defaults — точные строки спецификации. Нестроковые/пустые после trim labels и label, нестроковый description, неполная пара или неконечные размеры → TypeError; конечные размеры ≤0 → RangeError. Массив видимости проверяется Array.from (holes не пропускаются), каждый элемент string; duplicate → RangeError. Unknown ID не создаёт серию.

Начальная реализация выводит фиксированный plot, либо пустой plot-контейнер, когда размеры отсутствуют; responsive lifecycle добавляется Task 2. Не обещать завершённый adaptive режим в Task 1.

```tsx
const layout = buildRadarLayout({metrics,series,radius:100});
const id = useId();
const [internal,setInternal] = useState<readonly string[]>(() =>
  [...(defaultVisibleSeries ?? series.map(item => item.id))]);
const source = visibleSeries ?? internal;
const visible = source.filter(value => series.some(item => item.id === value));
function toggle(value:string) {
  const next = getSelectionValue(visible,{type:'toggle',value});
  if (visibleSeries === undefined) setInternal([...next]);
  onVisibleSeriesChange?.([...next]);
}
```

Root figure после native props получает внутренние aria-labelledby/aria-describedby; figcaption содержит label, description — отдельный p. IDs через useId. Callback и state получают разные копии: пользователь не может менять internal через callback.

RadarPlot строит grid из `layout.axes.map(axis => [axis.x*ratio,axis.y*ratio].join(','))` для `[0.25,0.5,0.75,1]`; series polygon — аналогично из `item.points`. Исходные metrics/series передаются вместе с layout: slot callbacks получают соответствующие оригинальные объекты, а не вычисленную ось или points-серию без values. SVG после slotProps получает width/height/viewBox/preserveAspectRatio/aria-hidden/focusable="false". Не добавлять SVG tabindex. Axis line `(0,0)→(axis.x,axis.y)`; text позиция `axis.x*1.12,axis.y*1.12`, anchor middle при `abs(x)<1e-8`, иначе start справа/end слева. Эти числа — координаты, не paint. User-props применяются до управляемых атрибутов и дочерних узлов; dangerouslySetInnerHTML не передаётся.

RadarDataTable использует TableAdapter.Head/Body/Row/HeaderCell/Cell. Caption `${label}: ${labels.dataTable}`. Столбцы metric/domain/direction, затем все series. HeaderCell scope="col" для заголовков, scope="row" для показателя. Label fallback `item.label || item.id`; диапазон `${min} — ${max}`, direction по reverse. Значения — `item.values[metric.id]` (вход уже проверен C1). Никакого CSS hiding или filtered-series table.

Легенда — `<div role="group" aria-label={labels.legend}>` и кнопки всех series; после пользовательского onClick проверяется defaultPrevented и вызывается toggle. Вызовы повторяемых slot-функций получают оригинальную метрику/серию, не её порядковый номер. Ref figure передаётся непосредственно. Plot container ref до Task 2 — пользовательский ref; остальные refs сохраняются. Собственные children всегда после spread.

Run тот же targeted test. Expected GREEN на четырёх осях, двух полигонах и таблице. Экспорт через index/unstyled/root, без logic binding и CSS.

- [ ] **Step 3: RED→GREEN выбора и пограничных входов.** Добавить реальные interaction-тесты:

```tsx
it('keeps controlled DOM unchanged until the owner updates it', async () => {
  const changed = vi.fn(); const user = userEvent.setup();
  const {container,rerender} = render(<RadarChartAdapter label="Сравнение" metrics={metrics}
    series={series} width={400} height={320} visibleSeries={['A','B']} onVisibleSeriesChange={changed} />);
  await user.click(screen.getByRole('button',{name:'Вариант A'}));
  expect(changed).toHaveBeenCalledWith(['B']);
  expect(container.querySelectorAll('polygon[data-series-id]')).toHaveLength(2);
  rerender(<RadarChartAdapter label="Сравнение" metrics={metrics} series={series}
    width={400} height={320} visibleSeries={['B']} />);
  expect(container.querySelectorAll('polygon[data-series-id]')).toHaveLength(1);
});
it('isolates internal state from a mutating callback and supports keyboard buttons', async () => {
  const user = userEvent.setup();
  const {container} = render(<RadarChartAdapter label="Сравнение" metrics={metrics} series={series}
    width={400} height={320} onVisibleSeriesChange={next => next.push('A')} />);
  await user.tab(); await user.keyboard('{Enter}');
  expect(screen.getByRole('button',{name:'Вариант A'}).getAttribute('aria-pressed')).toBe('false');
  expect(container.querySelectorAll('polygon[data-series-id]')).toHaveLength(1);
  await user.tab(); await user.keyboard(' ');
  expect(container.querySelectorAll('polygon[data-series-id]')).toHaveLength(0);
  expect(screen.getAllByRole('row')).toHaveLength(5);
});
```

Дополнить конкретными fixtures: controlled callback `next.length=0` не меняет frozen visible input; onClick.preventDefault оставляет state и не вызывает callback; серия A удаляется и возвращается до следующего toggle (выбор по ID сохраняется); после toggle отсутствующий A не попадает в callback; новая серия C не выбирается автоматически. `defaultVisibleSeries` меняется после mount — текущий выбор не сбрасывается. Неизвестный ID игнорируется. ID `__proto__`/`constructor` проверяются в кнопках и callback через точные сравнения, не CSS-селектор из пользовательского ID.

Длинная label (>200 символов), пустые metric/series label, reverse, empty series, два экземпляра/useId, frozen input и ошибочный скрытый value покрываются assertions по DOM/ошибкам. Invalid fixtures: width без height, height без width, width string/NaN/Infinity, width 0/-1, height 0, label ''/' '/number, description number, labels `{legend:''}`/number, visibleSeries object/string/sparse/duplicate. Проверять TypeError/RangeError спецификации.

JS-only slot attack: cast as any с plot.viewBox/tabIndex, polygon.points, button.type/aria-pressed/children/aria-label/aria-labelledby/disabled, table aria-hidden/hidden/role, root aria-labelledby. Проверить собственные атрибуты и настоящих детей после spread. Управляемые ARIA и атрибуты, не получающие собственного значения в JSX, удалять из slot props явно; одного порядка spread недостаточно для aria-label или tabindex. Заглушенные aria-hidden/hidden/role удалить из table props, а не передать до детей. User className/style/data-test, refs и click handler должны работать; arbitrary CSS пользователя не фильтруется.

Каждую ещё отсутствующую ветку сначала воспроизвести failing test, затем минимально реализовать; повторить targeted test до GREEN.

- [ ] **Step 4: fixed SSR и публичные types.** SSR-файл с `// @vitest-environment node`, renderToString:

```tsx
it('renders fixed SVG and data without DOM globals', () => {
  expect(typeof document).toBe('undefined');
  const html = renderToString(<RadarChartAdapter label="Сравнение" metrics={metrics}
    series={series} width={400} height={320} />);
  expect(html).toContain('<svg'); expect(html).toContain('<table');
  expect(html).toContain('aria-pressed="true"');
});
```

В каждом test-файле объявить fixtures из Step 1 (не зависеть от исполнения другого test-файла). Type-test импортирует публичный RadarChartAdapter и RadarChartAdapterProps; positive readonly arrays, figure ref, slot callbacks с корректным metric/series типом; negatives missing label, partial dimensions, polygon points, button aria-pressed/children, native children. Для каждого negative — @ts-expect-error.

Run `node node_modules/vitest/vitest.mjs run packages/adapters/react/tests/Visualization/RadarChart --reporter=dot`, `pnpm --filter @dreadnought/core build`, `pnpm --filter @dreadnought/react build`, `pnpm typecheck`. Expected все GREEN, verifyBuild подтверждает отсутствие UI/CSS. Commit `feat(react): add unstyled SVG Radar adapter`.

## Task 2: адаптивный viewport и observer lifecycle

**Interfaces:** Consumes Task 1 RadarChartAdapter/RadarChartAdapterProps. Produces private `useRadarViewport(width:number|undefined,height:number|undefined,ref:RefObject<HTMLDivElement|null>): {width:number;height:number}|undefined`; root продолжает публиковать тот же API и передаёт вычисленную пару RadarPlot.

- [ ] **Step 1: RED measured режима.** Новый тест устанавливает ResizeObserver через vi.stubGlobal, собирает callbacks/observed nodes/disconnect:

```tsx
const observers: {callback:ResizeObserverCallback;observe:ReturnType<typeof vi.fn>;disconnect:ReturnType<typeof vi.fn>}[] = [];
vi.stubGlobal('ResizeObserver',class {
  observe=vi.fn(); disconnect=vi.fn();
  constructor(callback:ResizeObserverCallback) { observers.push({callback,observe:this.observe,disconnect:this.disconnect}); }
});
const {container,unmount} = render(<RadarChartAdapter label="Сравнение" metrics={metrics} series={series} />);
const observer=observers[0]; const target=observer.observe.mock.calls[0][0];
function measure(width:number) {
  act(() => observer.callback([{target,contentRect:{width}}] as ResizeObserverEntry[], {} as ResizeObserver));
}
expect(container.querySelector('svg')).toBeNull();
measure(500); expect(container.querySelector('svg')?.getAttribute('height')).toBe('400');
measure(0); expect(container.querySelector('svg')).toBeNull();
measure(250); expect(container.querySelector('svg')?.getAttribute('width')).toBe('250');
unmount(); expect(observer.disconnect).toHaveBeenCalledTimes(1);
```

Run `node node_modules/vitest/vitest.mjs run packages/adapters/react/tests/Visualization/RadarChart/RadarViewport.test.tsx --reporter=dot`. Expected RED: нет observe/измеренного SVG.

- [ ] **Step 2: minimal hook и ref composition.** Размеры уже валидирует Task 1. Hook использует ownerDocument.defaultView?.ResizeObserver, затем global ResizeObserver при его наличии; SSR effect не выполняется.

```ts
const [measurement,setMeasurement] = useState<{target:HTMLDivElement;width:number}|undefined>();
useEffect(() => {
  const target = ref.current;
  if (width !== undefined || !target) return;
  let active = true;
  const Observer = target.ownerDocument.defaultView?.ResizeObserver ?? globalThis.ResizeObserver;
  if (!Observer) return;
  const observer = new Observer(entries => {
    const entry = entries.find(item => item.target === target);
    if (active && entry) setMeasurement({target,width:entry.contentRect.width});
  });
  observer.observe(target);
  return () => { active=false; observer.disconnect(); };
},[width,height,ref]);
if (width !== undefined && height !== undefined) return {width,height};
const measured = measurement?.target === ref.current ? measurement.width : 0;
return Number.isFinite(measured) && measured > 0 ? {width:measured,height:measured*4/5} : undefined;
```

При новом responsive lifecycle очищать measurement в effect setup (не использовать старую fixed→adaptive ширину до первого нового callback). Двойной cleanup сохраняет active guard. SVG выходит только при finite положительной паре; модель radius остаётся 100.

Plot-контейнер всегда один и тот же div. Применить local ref и пользовательский plotContainer ref через existing attachRef; использовать стабильный callback/useCallback, cleanup сбрасывает local ref. Callback ref не должен пересоздаваться на каждое измерение. Fixed mode не создаёт observer. Native figure ref не перехватывается.

Repeat measured test. Expected GREEN: width/height 500/400, 250/200, нулевая ширина убирает SVG без удаления таблицы/легенды.

- [ ] **Step 3: RED→GREEN lifecycle/hydration.** Дополнить реальными сценариями: controlled visibility сохраняется при 0→positive width; NaN/Infinity/negative measurements не создают SVG; fixed dimensions не создают observer; fixed→adaptive ждёт нового callback; adaptive→fixed игнорирует старый callback. StrictMode setup/cleanup leaves one active observer, после unmount callback не меняет контейнер; plot-container callback ref cleanup вызывается; без ResizeObserver данные видны и SVG отсутствует.

Hydration test в jsdom: renderToString adaptive → контейнер.innerHTML → hydrateRoot той же JSX с onRecoverableError spy → ошибок нет и до первого измерения нет SVG → callback добавляет SVG. Fixed SSR остаётся в node SSR-test из Task 1; adaptive SSR содержит table/buttons, но не svg, без document. Добавить fixtures и stub setup в этот файл, не импортировать side effects другого test-файла.

Run targeted Radar suite, `pnpm --filter @dreadnought/react build`, `pnpm typecheck`. Expected GREEN. Commit `feat(react): make Radar viewport responsive`.

## Task 3: честный каталог L2 и документация

**Interfaces:** Consumes публичный RadarChartAdapter и его types. Produces entry `component:radar-chart`, family Visualization, binding `react-adapter` layer 2, framework react; `composesWith:['domain:build-radar-layout']`. Doc key `radarchart`, маршрут `/components/radarchart/`, API anchor `radarchart-api`. C1 entry остаётся отдельным domain.

- [ ] **Step 1: RED каталога без третьего слоя.** В catalog.test.ts добавить:

```ts
it('publishes Radar adapter without synthetic core, UI or theme', () => {
  const entry=catalog.entries.find(entry=>entry.id==='component:radar-chart');
  expect(entry).toMatchObject({family:'Visualization',tokens:[],composesWith:['domain:build-radar-layout']});
  expect(entry!.bindings.map(binding=>binding.id)).toEqual(['react-adapter']);
  expect(entry!.bindings[0]).toMatchObject({layer:2,framework:'react',importPath:'@dreadnought/react/unstyled',exportName:'RadarChartAdapter'});
  expect(()=>checkExamples(context,entry!.bindings[0].examples)).not.toThrow();
});
```

Run targeted test. Expected RED missing entry; после metadata/config Expected RED от попытки читать отсутствующую тему.

- [ ] **Step 2: metadata, generator и MCP.** Config components добавить `{family:'Visualization',name:'RadarChart',sources:[adapter]}`. Metadata object содержит id/kind/name/family/description/docsUrl/states/constraints/composesWith и один adapter binding. Checked example:

```tsx
import { RadarChartAdapter } from '@dreadnought/react/unstyled';
const metrics = ['quality','coverage','latency'].map(id=>({id,label:id,domain:[0,100] as const}));
const series = [{id:'a',label:'A',values:{quality:80,coverage:70,latency:60}}];
export function Example() { return <RadarChartAdapter label="Сравнение" metrics={metrics} series={series} width={400} height={320} />; }
```

Property descriptions для metrics/series/label/description/width/height/visibleSeries/defaultVisibleSeries/onVisibleSeriesChange/labels/slotProps должны совпадать с compiler props. Не задавать фиктивный defaults.width/height; отсутствие размеров включает измерение.

В generateCatalog читать theme tokens только когда `entry.kind==='component' && bindings.some(binding=>binding.layer===3)`, иначе []. Сам readComponentTokens продолжает строго проверять тему готового компонента. Existing tokens test проверяет >0 только для ready entries и [] для Radar; число компонентов сверяется с explicit components, не фиксировать 19. В настоящем MCP transport test запросить RadarChart layer 2 context и API, получить checked example/required label без react-ui/core bindings. C1 get/list domain тест остаётся.

Run `node node_modules/vitest/vitest.mjs run tools/catalog/tests/catalog.test.ts tools/catalog/tests/mcpServer.test.ts --reporter=dot`. Expected GREEN, старые capability queries сохраняются.

- [ ] **Step 3: RED→GREEN документационной проекции.** В catalogDocs.test.ts добавить fixture entry только react-adapter c API label и checked example. Assertions: generated.components.radarchart.adapterCode содержит RadarChartAdapter, readyCode отсутствует, apiRows содержит label; у существующего Layout готовые rows/defaults прежние. Ошибочная ready entry без примера по-прежнему отвергается.

В prepareCatalogDocs adapter обязателен; ready optional, но если присутствует — его example обязателен. Projection:

```js
const apiLayer = ready ? 3 : 2;
const relatedCore = (entry.composesWith ?? []).map(id=>catalog.entries.find(item=>item.id===id))
  .find(item=>item?.kind==='domain')?.bindings.find(binding=>binding.id==='core');
const logic = entry.bindings.find(binding=>binding.id==='react-logic')
  ?? entry.bindings.find(binding=>binding.layer===1) ?? relatedCore;
components[entry.name.toLowerCase()] = {
  ...(ready ? {readyCode:ready.examples[0].code} : {}),
  adapterCode:adapter.examples[0].code,
  ...(logic?.examples[0] ? {logicCode:logic.examples[0].code} : {}),
  apiRows:entry.bindings.filter(binding=>binding.layer===apiLayer).flatMap(binding=>apiRows(entry,binding)),
};
```

В CatalogDoc/getCatalogDoc и ComponentDoc readyCode становится optional, без подстановки adapterCode как «готовый компонент». DocsPage: пример использует `doc.readyCode ?? doc.adapterCode`, подпись `doc.readyCode ? 'Готовый компонент' : 'Адаптер второго слоя'`; текст layers также отражает отсутствие ready. Рендер логики C1 не добавляет component core binding.

- [ ] **Step 4: живая страница и тесты.** Создать RadarChartDoc по ComponentDoc. Demo использует настоящий публичный адаптер с label="Сравнение вариантов", три метрики и две серии (A/B), controlled state useState([...series IDs]); SVG presentation только в DocsPage.module.css и slotProps classNames. Легенду при необходимости оформлять классом приложения, не подменять нативные кнопки третьим слоем. Paint: currentColor/существующие глобальные токены, rgb с процентной прозрачностью; никакого CSS внутри пакета адаптера.

Добавить radarchart в ComponentSection/componentDocs и family Visualization; Astro маршрут по существующему Card-route шаблону с DocsPage section="radarchart" client:load, title/description RadarChartAdapter. Footnote явно сообщает, что UI-тема и готовый RadarChart не выпущены. Domain C1 пример берётся из generated logicCode.

DocsPage.test.tsx:

```tsx
it('documents an adapter-only Radar with real selection and API', () => {
  render(<DocsPage section="radarchart" />);
  expect(document.getElementById('radarchart-api')).toBeTruthy();
  expect(screen.getByRole('link',{name:'RadarChartAdapter'}).getAttribute('href')).toBe('/components/radarchart/');
  const button=screen.getByRole('button',{name:'Вариант A'});
  fireEvent.click(button); expect(button.getAttribute('aria-pressed')).toBe('false');
  expect(screen.getByRole('table',{name:'Сравнение вариантов: Данные'})).toBeTruthy();
  expect(screen.getByText('Адаптер второго слоя')).toBeTruthy();
});
```

Generated ignored doc JSON создаётся обычным catalog build → prepareCatalogDocs, не редактируется вручную. При добавлении маршрута обновить существующие проверяемые counts/route lists только после evidence нового output; остальные assertions не ослаблять.

В core-capabilities и roadmap отметить C2 реализованным после проверок, C3 остаётся отдельным этапом; core model остаётся domain. Добавить пояснение длинных SVG labels, отсутствующего ResizeObserver и наличия полной таблицы.

- [ ] **Step 5: полная проверка, браузер и коммит.** Последовательно `pnpm catalog`, `node apps/docs/src/catalog/generateDocData.mjs`, targeted Radar/catalog/docs tests, `pnpm typecheck`, `pnpm -r build`, `node apps/docs/scripts/buildKnowledge.mjs --public`, полный `node node_modules/vitest/vitest.mjs run --reporter=dot`; outputs прочитать. Не запускать две сборки документации параллельно.

Запустить документацию через existing docs script и проверить в CUA браузере маршрут: Tab→Enter/Space скрывает и возвращает series, таблица остаётся полной; изменение доступной ширины через sidebar без window resize меняет SVG viewport. Проверить узкую ширину: код и таблица не расширяют страницу; длинные подписи не уничтожают доступные данные. Не обещать полного screen-reader coverage.

Git diff --check, exact own staging (ignored docs — add -f), commit `feat(catalog): publish Radar adapter and documentation`. Task 3 завершена только при green targeted/full suite/build/types/browser; generated artifacts не коммитить.

## Self-review и handoff

Spec coverage: Task 1 покрывает API/валидацию/SVG/legend/table/slotProps/fixed SSR; Task 2 — adaptive sizing/cleanup/hydration; Task 3 — публичный каталог/MCP/adapter-only docs/browser. Review Focus 1/2/4 закреплён Task 1, 3 — Task 2, 5 — Task 3. Независимые новые подсистемы или dependencies не добавлены.

Рекомендуется native execution: три последовательных результата с тесно связанными типами, один исполнитель и один fresh-context reviewer всего diff после задач. Пользователь ранее выбрал работу «здесь»; сохранить этот метод после согласования данного плана. До review плана код реализации не писать.
