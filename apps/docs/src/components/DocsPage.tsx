import { getCatalogDoc } from '../catalog/getCatalogDoc';
import { useEffect, useRef, useState } from 'react';
import { Accordion, Breadcrumb, Button, Card, CodeBlock, Input, Layout, Table, TextArea } from '@dreadnought/ui/react';
import { badgeDoc } from './componentDocs/BadgeDoc';
import { cardDoc } from './componentDocs/CardDoc';
import { tabsDoc } from './componentDocs/TabsDoc';
import { menuDoc } from './componentDocs/MenuDoc';
import { dropdownDoc } from './componentDocs/DropdownDoc';
import { accordionDoc } from './componentDocs/AccordionDoc';
import { codeBlockDoc } from './componentDocs/CodeBlockDoc';
import { alertDoc } from './componentDocs/AlertDoc';
import { toastDoc } from './componentDocs/ToastDoc';
import { loaderDoc } from './componentDocs/LoaderDoc';
import { progressDoc } from './componentDocs/ProgressDoc';
import { paginationDoc } from './componentDocs/PaginationDoc';
import { treeDoc } from './componentDocs/TreeDoc';
import { layoutDoc } from './componentDocs/LayoutDoc';
import { breadcrumbDoc } from './componentDocs/BreadcrumbDoc';
import { iconDoc } from './componentDocs/IconDoc';
import { markDoc } from './componentDocs/MarkDoc';
import { TableManualDemo } from './componentDocs/TableManualDemo';
import { TableFiltersDemo } from './componentDocs/TableFiltersDemo';
import { checkboxDoc } from './componentDocs/CheckboxDoc';
import { switchDoc } from './componentDocs/SwitchDoc';
import { sliderDoc } from './componentDocs/SliderDoc';
import { radioDoc } from './componentDocs/RadioDoc';
import { selectDoc } from './componentDocs/SelectDoc';
import { markdownEditorDoc } from './componentDocs/MarkdownEditorDoc';
import { markdownPreviewDoc } from './componentDocs/MarkdownPreviewDoc';
import { toolbarDoc } from './componentDocs/ToolbarDoc';
import { radarChartDoc } from './componentDocs/RadarChartDoc';
import { lineChartDoc } from './componentDocs/LineChartDoc';
import { barChartDoc } from './componentDocs/BarChartDoc';
import { tooltipDoc } from './componentDocs/TooltipDoc';
import { popoverDoc } from './componentDocs/PopoverDoc';
import { modalDoc } from './componentDocs/ModalDoc';
import { drawerDoc } from './componentDocs/DrawerDoc';
import { GettingStarted } from './GettingStarted';
import { ThemingGuide } from './ThemingGuide';
import { CustomComponentsGuide } from './CustomComponentsGuide';
import { searchKnowledge } from '../knowledge/searchKnowledge.ts';
import { useKnowledge } from '../knowledge/useKnowledge.ts';
import { DocsAssistant } from '../assistant/DocsAssistant.tsx';
import type { ComponentDoc } from './componentDocs/types';
import styles from './DocsPage.module.css';
import { ComponentOutline } from './ComponentOutline.tsx';

type ComponentSection = 'button' | 'toolbar' | 'input' | 'textarea' | 'markdowneditor' | 'markdownpreview' | 'table' | 'badge' | 'card' | 'tabs' | 'menu' | 'dropdown' | 'accordion' | 'codeblock' | 'alert' | 'toast' | 'loader' | 'progress' | 'pagination' | 'tree' | 'layout' | 'breadcrumb' | 'icon' | 'mark' | 'checkbox' | 'switch' | 'slider' | 'radio' | 'select' | 'radarchart' | 'linechart' | 'barchart' | 'tooltip' | 'popover' | 'modal' | 'drawer';
type DocsSection = 'overview' | 'getting-started' | 'theming' | 'custom-components' | ComponentSection;
const componentFamilies: readonly { name: string; sections: readonly ComponentSection[] }[] = [
  { name: 'Controls', sections: ['button', 'toolbar'] },
  { name: 'DataDisplay', sections: ['badge', 'codeblock', 'icon', 'mark', 'table', 'markdownpreview'] },
  { name: 'Feedback', sections: ['alert', 'toast', 'loader', 'progress'] },
  { name: 'Fields', sections: ['input', 'textarea', 'markdowneditor', 'checkbox', 'switch', 'radio', 'select', 'slider'] },
  { name: 'Layout', sections: ['layout'] },
  { name: 'Navigation', sections: ['accordion', 'breadcrumb', 'tabs', 'menu', 'dropdown', 'pagination', 'tree'] },
  { name: 'Surfaces', sections: ['card'] },
  { name: 'Visualization', sections: ['radarchart', 'linechart', 'barchart'] },
  { name: 'Overlays', sections: ['tooltip', 'popover', 'modal', 'drawer'] },
];

function Header() {
  return <Layout.Header className={styles.header}>
    <h4 className={styles.brand}><a href="/" title="На главную">Dreadnought</a></h4>
  </Layout.Header>;
}

function Footer() {
  const wordRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const word = wordRef.current!, container = word.parentElement!;
    let frame = 0;
    function fit() {
      if (!word.isConnected) return;
      const width = word.getBoundingClientRect().width, available = container.clientWidth;
      if (width > 0 && available > 0 && Math.abs(width - available) > .5) {
        word.style.fontSize = `${parseFloat(getComputedStyle(word).fontSize) * available / width}px`;
      }
    }
    function resize() { cancelAnimationFrame(frame); frame = requestAnimationFrame(fit); }
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize);
    observer?.observe(container); observer?.observe(word);
    window.addEventListener('resize', resize);
    document.fonts?.ready.then(resize);
    fit();
    return () => { observer?.disconnect(); window.removeEventListener('resize', resize); cancelAnimationFrame(frame); };
  }, []);
  return <Layout.Footer className={styles.footer}><div className={styles.footerWidth}>
    <span ref={wordRef} className={styles.footerWord}>DREADNOUGHT</span>
  </div></Layout.Footer>;
}

function Sidebar({ section, knowledge }: { section: DocsSection; knowledge: ReturnType<typeof useKnowledge> }) {
  const [query, setQuery] = useState('');
  const results = searchKnowledge(knowledge.entries, query);

  return <Layout.Sidebar className={styles.sidebar} slotClassNames={{ body: styles.sidebarBody }} aria-label="Разделы документации" expandLabel="Открыть меню" collapseLabel="Свернуть меню">
    <div role="search" className={styles.search}>
      <Input type="search" aria-label="Поиск по документации" placeholder="Поиск по документации"
        value={query} onChange={(event) => setQuery(event.target.value)} />
    </div>
    {query.trim() ? <div className={styles.searchResults}>
      <span className={styles.navigationGroup} role="status">{knowledge.loading ? 'Загрузка поиска…' : `Результаты поиска: ${results.length}`}</span>
      {knowledge.error ? <div role="alert"><p>{knowledge.error}</p><Button size="compact" variant="secondary" onClick={knowledge.retry}>Повторить</Button></div> : results.length ? results.map((result) => <a key={result.id} className={styles.searchResult} href={result.url}>
        <strong>{result.title}</strong>
        <span>{result.text.slice(0, 150)}</span>
      </a>) : !knowledge.loading && <p className={styles.searchEmpty}>Ничего не найдено</p>}
    </div> : <nav className={styles.navigation} aria-label="Страницы документации">
      <span className={styles.navigationGroup}>Начало</span>
      <a className={styles.navigationLink} href="/" aria-current={section === 'overview' ? 'page' : undefined}>Обзор</a>
      <a className={styles.navigationLink} href="/getting-started/" aria-current={section === 'getting-started' ? 'page' : undefined}>Начало работы</a>
      <a className={styles.navigationLink} href="/theming/" aria-current={section === 'theming' ? 'page' : undefined}>Тема и токены</a>
      <a className={styles.navigationLink} href="/custom-components/" aria-current={section === 'custom-components' ? 'page' : undefined}>Свой компонент</a>
      <span className={styles.navigationGroup}>Компоненты</span>
      <Accordion key={section} multiple className={styles.navigationFamilies}
        defaultValue={componentFamilies.filter(family => family.sections.some(component => component === section)).map(family => family.name)}>
      {componentFamilies.map((family) => <Accordion.Item key={family.name} value={family.name}>
        <Accordion.Trigger headingLevel={2}>{family.name}</Accordion.Trigger>
        <Accordion.Panel className={styles.familyLinks}>
          {family.sections.map((component) => <a key={component} className={styles.navigationLink}
            href={`/components/${component}/`} aria-current={section === component ? 'page' : undefined}>
            {componentDocs[component].title}
          </a>)}
        </Accordion.Panel>
      </Accordion.Item>)}
      </Accordion>
    </nav>}
  </Layout.Sidebar>;
}

function PageHeading({ title, description }: { title: string; description: string }) {
  return <div className={styles.pageHeading}>
    <h1 className={styles.title}>{title}</h1>
    <p className={styles.lead}>{description}</p>
  </div>;
}

function Overview() {
  return <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация' }, { label: 'Обзор' }]} aria-label="Путь по документации" />
    <PageHeading title="Начните с готового компонента" description="Dreadnought объединяет общую логику, адаптеры под фреймворк и оформленные компоненты. Берите ровно тот слой, который нужен вашему проекту." />
    <section data-knowledge className={styles.section} aria-labelledby="overview-layers">
      <h2 id="overview-layers" className={styles.sectionTitle}>Три уровня использования</h2>
      <div className={styles.layerList} role="list" aria-label="Три уровня использования">
        <Card role="listitem" className={styles.layerCard}><strong>Готовый компонент</strong><span>Подключайте с темой и меняйте внешний вид через токены.</span></Card>
        <Card role="listitem" className={styles.layerCard}><strong>Адаптер</strong><span>Оставляйте разметку и поведение, задавая свои стили.</span></Card>
        <Card role="listitem" className={styles.layerCard}><strong>Логика</strong><span>Собирайте собственный компонент на базовом поведении.</span></Card>
      </div>
      <div className={styles.overviewActions}>
        <Button href="/getting-started/" className={styles.overviewAction}>Начать работу</Button>
        <Button href="/components/button/" variant="secondary" className={styles.overviewAction}>Посмотреть Button</Button>
      </div>
    </section>
  </article>;
}

function ButtonDemo() {
  const [count, setCount] = useState(0);

  return <div className={styles.demo}>
    <div className={styles.demoRow}>
      <Button onClick={() => setCount((value) => value + 1)}>Нажать</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="ghosted">Ghosted</Button>
    </div>
    <p className={styles.demoResult} aria-live="polite">Нажатий: {count}</p>
  </div>;
}

function TableDemo() {
  const [hideCity, setHideCity] = useState(false);
  return <div className={`${styles.demo} ${styles.demoStack}`}>
    <TableManualDemo />
    <TableFiltersDemo />
    <p><code>processing="local"</code> — обработка полного набора данных внутри таблицы. <code>processing="manual"</code> — показ переданной страницы без локальных фильтров, сортировки и обрезки. Для пагинации укажите <code>pagination.total</code>; без пагинации передайте <code>pagination=false</code>. Серверные колонки используют <code>sorter: true</code> или <code>sorter: {'{ multiple: 2 }'}</code>. <code>onChange</code> сообщает запрос, а <code>extra.currentDataSource</code> и <code>summary</code> получают переданные строки. <code>loading</code> использует Loader и не удаляет таблицу или фокус; параметры Loader доступны в <code>slotProps.loader</code>. Выбранные ключи сохраняются между страницами, но <code>rowSelection.onChange</code> возвращает записи только из доступной страницы.</p>
    <Button variant="secondary" size="compact" onClick={() => setHideCity(!hideCity)}>{hideCity ? 'Показать город' : 'Скрыть город'}</Button>
    <Table<{ key: number; name: string; email: string; city: string }> aria-label="Многоуровневая шапка" bordered sticky scroll={{ x: 700, y: 320 }} pagination={false}
      dataSource={[{ key: 1, name: 'Анна', email: 'anna.very.long.email.address.for.documentation@example.com', city: 'Москва' }, { key: 2, name: 'Марк', email: 'mark@example.com', city: 'Казань' }]}
      columns={[
        { key: 'name', title: 'Участник', dataIndex: 'name', width: 160, fixed: 'left' },
        { key: 'contacts', title: 'Контакты', children: [
          { key: 'email', title: 'Почта', dataIndex: 'email', width: 260, ellipsis: true },
          { key: 'address', title: 'Адрес', children: [{ key: 'city', title: 'Город', dataIndex: 'city', width: 180, align: 'center', hidden: hideCity }] },
        ] },
      ]} />
    <Table
      aria-label="Пример таблицы"
      rowKey="id"
      dataSource={[{ id: 1, name: 'Борис', role: 'Разработчик' }, { id: 2, name: 'Анна', role: 'Дизайнер' }]}
      columns={[
        { key: 'name', title: 'Имя', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { key: 'role', title: 'Роль', dataIndex: 'role' },
      ]}
      pagination={false}
      bordered
    />
    <p><code>summary(rows)</code> получает строки текущей страницы после фильтрации и сортировки. При <code>pagination=false</code> — все подходящие строки. Верните строки через <code>Table.Row</code> и ячейки через <code>Table.Cell</code>: <code>tfoot</code> создаётся автоматически. Формулы и <code>colSpan</code> задаёт приложение; <code>null</code> скрывает итог. Итоги прокручиваются с таблицей, закрепление колонок на ручные ячейки не переносится.</p>
    <p>Для нескольких колонок задайте <code>sorter: {'{ compare, multiple }'}</code>: большее <code>multiple</code> означает более высокий приоритет, равные приоритеты следуют порядку колонок. Нажмите «Команда», затем «Участник»: имя уточняет порядок внутри команды. Третье нажатие сбрасывает только выбранную колонку. Обычная функция <code>sorter</code> переключает таблицу обратно на одиночную сортировку. <code>sortOrder</code> управляет состоянием, <code>defaultSortOrder</code> задаёт начальное значение. Управляемая одиночная сортировка имеет приоритет над цепочкой. Третий аргумент <code>onChange</code> остаётся объектом выбранной колонки; полный порядок доступен в <code>extra.sorters</code>, при фильтре и пагинации — тоже.</p>
    <Table<{ key: number; team: string; name: string }> aria-label="Множественная сортировка" bordered pagination={false}
      dataSource={[{ key: 1, team: 'Разработка', name: 'Марк' }, { key: 2, team: 'Дизайн', name: 'Нина' }, { key: 3, team: 'Разработка', name: 'Анна' }, { key: 4, team: 'Дизайн', name: 'Лев' }]}
      columns={[
        { key: 'team', title: 'Команда', dataIndex: 'team', sorter: { compare: (a, b) => a.team.localeCompare(b.team), multiple: 2 } },
        { key: 'name', title: 'Участник', dataIndex: 'name', sorter: { compare: (a, b) => a.name.localeCompare(b.name), multiple: 1 } },
      ]} />
    <Table<{ key: number; item: string; amount: number }> aria-label="Итоги страницы" bordered pagination={{ pageSize: 2 }}
      dataSource={[{ key: 1, item: 'Дизайн', amount: 120 }, { key: 2, item: 'Разработка', amount: 240 }, { key: 3, item: 'Тестирование', amount: 80 }]}
      columns={[{ key: 'item', title: 'Работа', dataIndex: 'item' }, { key: 'amount', title: 'Часы', dataIndex: 'amount', align: 'right', sorter: (a, b) => a.amount - b.amount }]}
      summary={rows => <Table.Row><Table.HeaderCell scope="row">Итого на странице</Table.HeaderCell>
        <Table.Cell style={{ textAlign: 'right' }}>{rows.reduce((sum, row) => sum + row.amount, 0)}</Table.Cell>
      </Table.Row>} />
    <Table<{ id: number; name: string; city: string }> aria-label="Раскрываемые строки" bordered rowKey="id" pagination={false}
      dataSource={[{ id: 1, name: 'Анна', city: 'Москва' }, { id: 2, name: 'Марк', city: 'Казань' }]}
      columns={[{ key: 'name', title: 'Участник', dataIndex: 'name' }]}
      expandable={{ defaultExpandedRowKeys: [1], expandedRowRender: record => <p>Город: {record.city}</p> }} />
    <Table<{ id: number; team: string; name: string }> aria-label="Объединённые ячейки" rowKey="id" pagination={false} bordered
      dataSource={[{ id: 1, team: 'Дизайн', name: 'Анна' }, { id: 2, team: 'Дизайн', name: 'Нина' }, { id: 3, team: 'Разработка', name: 'Марк' }]}
      onRow={record => ({ title: `Участник: ${record.name}` })}
      columns={[
        { key: 'team', title: 'Команда', dataIndex: 'team', onCell: (_record, index) => ({ rowSpan: index === 0 ? 2 : index === 1 ? 0 : 1 }) },
        { key: 'name', title: 'Участник', dataIndex: 'name', onHeaderCell: () => ({ title: 'Имя участника' }) },
      ]} />
  </div>;
}

function InputDemo() {
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <label htmlFor="demo-email">Электронная почта</label>
    <Input id="demo-email" type="email" name="demo-email" autoComplete="off" placeholder="name@example.com" />
    <label htmlFor="demo-password">Пароль</label>
    <Input id="demo-password" type="password" name="demo-password" autoComplete="new-password" passwordVisibilityLabels={{ show: 'Показать пароль', hide: 'Скрыть пароль' }} />
    <label htmlFor="demo-quantity">Количество</label>
    <Input id="demo-quantity" type="number" name="quantity" min={0} max={10} defaultValue="1"
      stepButtonLabels={{ decrease: 'Уменьшить значение', increase: 'Увеличить значение' }} />
  </div>;
}

function TextAreaDemo() {
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <label htmlFor="demo-notes">Заметки</label>
    <TextArea id="demo-notes" name="demo-notes" rows={3} autoSize maxRows={8} placeholder="Введите текст…" />
  </div>;
}

const componentDocs: Record<ComponentSection, ComponentDoc> = {
  markdownpreview: markdownPreviewDoc,
  markdowneditor: markdownEditorDoc,
  radarchart: radarChartDoc,
  linechart: lineChartDoc,
  barchart: barChartDoc,
  tooltip: tooltipDoc,
  popover: popoverDoc,
  modal: modalDoc,
  drawer: drawerDoc,
  checkbox: checkboxDoc,
  switch: switchDoc,
  slider: sliderDoc,
  radio: radioDoc,
  select: selectDoc,
  button: {
  ...getCatalogDoc('button'),
    title: 'Button',
    description: 'Действие или ссылка с готовыми состояниями, доступной семантикой и оформлением, которое можно заменить без изменения поведения.',
    adapterDescription: 'Адаптер создаёт нативный элемент и управляет его состояниями, но не подключает тему.',
    logicDescription: <>Хук возвращает свойства для собственного нативного <code>&lt;button&gt;</code>.</>,
    footnote: <>Поддерживаются также стандартные свойства <code>&lt;button&gt;</code> и <code>&lt;a&gt;</code>. Для кнопки только с иконкой задайте доступное имя через <code>aria-label</code>.</>,
    demo: <ButtonDemo />,
  },
  input: {
  ...getCatalogDoc('input'),
    title: 'Input',
    description: 'Однострочное поле: текст, пароль с переключателем видимости или число с кнопками уменьшения и увеличения.',
    adapterDescription: 'Адаптер создаёт поле и дополнительные кнопки без оформления. Для number шаг выполняет нативный input; готовый компонент использует Button.',
    logicDescription: 'Хук возвращает inputProps с ref, visibilityButtonProps для пароля и stepButtonProps для числа. Передайте полученные свойства своим элементам.',
    footnote: <>Поле принимает стандартные свойства <code>&lt;input&gt;</code>. Для number используйте <code>min</code>, <code>max</code>, <code>step</code>; <code>step="any"</code> отключает кнопки шага. <code>onChange</code> получает событие поля, пустое значение — пустая строка, не ноль. <code>className</code> относится к обёртке; подпись задавайте через <code>&lt;label&gt;</code> или ARIA, а не через placeholder.</>,
    demo: <InputDemo />,
  },
  textarea: {
  ...getCatalogDoc('textarea'),
    title: 'TextArea',
    description: 'Многострочное поле с ручным изменением высоты или автоматическим ростом по содержимому.',
    adapterDescription: 'Адаптер сохраняет нативное поле и управление высотой, но не задаёт оформление.',
    logicDescription: <>При своей разметке передайте <code>textAreaRef</code> нативному элементу, чтобы работал autoSize.</>,
    footnote: <>Без <code>autoSize</code> поле можно растягивать мышью в пределах <code>minRows</code> и <code>maxRows</code>. С <code>autoSize</code> высота следует за текстом, а ручное растягивание отключено.</>,
    demo: <TextAreaDemo />,
  },
  table: {
  ...getCatalogDoc('table'),
    title: 'Table',
    description: 'Структурированные данные с группами колонок, сортировкой, фильтрами, выбором и раскрытием строк, пагинацией и закреплением шапки.',
    adapterDescription: 'Адаптер сохраняет семантику и поведение таблицы, но позволяет оформить её самостоятельно.',
    logicDescription: 'Ядро рассчитывает уровни и объединения шапки, сортирует и фильтрует строки — независимо от фреймворка.',
    footnote: <>Для закреплённых колонок задайте <code>fixed</code>; их ширина измеряется автоматически, <code>width</code> задаёт необязательный минимум. Для колонок с объединённым или скрытым заголовком указывайте <code>width</code>: ширину каждой части нельзя измерить отдельно. <code>scroll</code> создаёт собственный контейнер прокрутки. При <code>rowSelection</code> обязателен уникальный ключ из <code>rowKey</code> или <code>record.key</code>: строка либо конечное число. <code>filteredValue: null</code> очищает управляемый фильтр. Фильтрация запрашивает страницу 1, сортировка сохраняет страницу; причина изменения доступна в <code>extra.action</code>. <code>onRow</code>, <code>onHeaderRow</code>, <code>column.onCell</code> и <code>column.onHeaderCell</code> возвращают нативные свойства, события и ref. Индекс строки относится к текущей странице после сортировки и фильтрации. Содержимое задаётся через render/title; геометрия width/fixed/sticky и aria-sort сохраняются. <code>rowSpan/colSpan=0</code> скрывает ячейку; остальные значения объединяют её. Согласованные spans и их пересчёт при изменении порядка строк задаёт приложение; не объединяйте ячейки через границу закреплённых областей.</>,
    demo: <TableDemo />,
  },
  badge: badgeDoc,
  card: cardDoc,
  toolbar: toolbarDoc,
  tabs: tabsDoc,
  menu: menuDoc,
  dropdown: dropdownDoc,
  accordion: accordionDoc,
  codeblock: codeBlockDoc,
  alert: alertDoc,
  toast: toastDoc,
  loader: loaderDoc,
  progress: progressDoc,
  pagination: paginationDoc,
  tree: treeDoc,
  layout: layoutDoc,
  breadcrumb: breadcrumbDoc,
  icon: iconDoc,
  mark: markDoc,
};

const copyLabels = { copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' };

function ComponentDocumentation({ component }: { component: ComponentSection }) {
  const doc = componentDocs[component];
  return <div className={styles.componentPage}>
    <ComponentOutline key={component} component={component} />
    <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация', href: '/' }, { label: 'Компоненты' }, { label: doc.title }]} aria-label="Путь по документации" />
    <div data-knowledge id={`${component}-overview`} data-knowledge-title={doc.title}><PageHeading title={doc.title} description={doc.description} /></div>

    <section className={styles.section} aria-labelledby={`${component}-example`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-example`} className={styles.sectionTitle}>Пример</h2>
      </div>
      {doc.demo}
      <CodeBlock code={doc.readyCode ?? doc.adapterCode} language="tsx" copyLabels={copyLabels} />
    </section>

    <section data-knowledge className={styles.section} aria-labelledby={`${component}-layers`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-layers`} className={styles.sectionTitle}>Когда нужен другой слой</h2>
      </div>
      <div className={styles.layerExamples}>
        <div>
          <h3 className={styles.subheading}>Свои стили — адаптер</h3>
          <p className={styles.bodyText}>{doc.adapterDescription}</p>
          <div data-knowledge-exclude><CodeBlock code={doc.adapterCode} language="tsx" copyLabels={copyLabels} /></div>
        </div>
        {doc.logicCode && <div>
          <h3 id={`${component}-logic`} className={styles.subheading}>Своя разметка — логика</h3>
          <p className={styles.bodyText}>{doc.logicDescription}</p>
          <div data-knowledge-exclude><CodeBlock code={doc.logicCode} language="tsx" copyLabels={copyLabels} /></div>
        </div>}
      </div>
    </section>

    <section className={styles.section} aria-labelledby={`${component}-api`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-api`} className={styles.sectionTitle}>Основные свойства</h2>
      </div>
      <div className={styles.tableScroll}>
        <Table bordered className={styles.apiTable}>
          <Table.Head><Table.Row><Table.HeaderCell scope="col">Свойство</Table.HeaderCell><Table.HeaderCell scope="col">Значения</Table.HeaderCell><Table.HeaderCell scope="col">По умолчанию</Table.HeaderCell><Table.HeaderCell scope="col">Назначение</Table.HeaderCell></Table.Row></Table.Head>
          <Table.Body>{doc.apiRows.map(([name, values, fallback, meaning]) => <Table.Row key={name}><Table.HeaderCell scope="row"><code>{name}</code></Table.HeaderCell><Table.Cell><code>{values}</code></Table.Cell><Table.Cell>{fallback}</Table.Cell><Table.Cell>{meaning}</Table.Cell></Table.Row>)}</Table.Body>
        </Table>
      </div>
      <p data-knowledge data-knowledge-id={`${component}-api`} data-knowledge-title={`${doc.title}: примечания`} className={styles.footnote}>{doc.footnote}</p>
    </section>
    </article>
  </div>;
}

export function DocsPage({ section }: { section: DocsSection }) {
  const knowledge = useKnowledge();
  return <Layout className={styles.shell}>
    <Header />
    <Layout direction="horizontal" className={styles.body}>
      <Sidebar section={section} knowledge={knowledge} />
      <Layout className={styles.contentColumn}>
        <Layout.Content className={styles.main}>
        <DocsContent section={section} />
        <aside id="docs-assistant" className={styles.assistantArea} aria-label="Помощник по документации">
          <DocsAssistant entries={knowledge.entries} loading={knowledge.loading} error={knowledge.error ?? undefined} />
        </aside>
        </Layout.Content>
        <Footer />
      </Layout>
    </Layout>
  </Layout>;
}

function DocsContent({ section }: { section: DocsSection }) {
  if (section === 'overview') return <Overview />;
  if (section === 'getting-started') return <GettingStarted />;
  if (section === 'theming') return <ThemingGuide />;
  if (section === 'custom-components') return <CustomComponentsGuide />;
  return <ComponentDocumentation component={section} />;
}
