import { getCatalogDoc } from '../catalog/getCatalogDoc';
import { useState } from 'react';
import { Breadcrumb, Button, Card, CodeBlock, Input, Layout, Table, TextArea } from '@dreadnought/ui/react';
import { badgeDoc } from './componentDocs/BadgeDoc';
import { cardDoc } from './componentDocs/CardDoc';
import { tabsDoc } from './componentDocs/TabsDoc';
import { accordionDoc } from './componentDocs/AccordionDoc';
import { codeBlockDoc } from './componentDocs/CodeBlockDoc';
import { alertDoc } from './componentDocs/AlertDoc';
import { layoutDoc } from './componentDocs/LayoutDoc';
import { breadcrumbDoc } from './componentDocs/BreadcrumbDoc';
import { iconDoc } from './componentDocs/IconDoc';
import { markDoc } from './componentDocs/MarkDoc';
import { GettingStarted } from './GettingStarted';
import { ThemingGuide } from './ThemingGuide';
import { CustomComponentsGuide } from './CustomComponentsGuide';
import { searchKnowledge } from '../knowledge/searchKnowledge.ts';
import { useKnowledge } from '../knowledge/useKnowledge.ts';
import { DocsAssistant } from '../assistant/DocsAssistant.tsx';
import type { ComponentDoc } from './componentDocs/types';
import styles from './DocsPage.module.css';

type ComponentSection = 'button' | 'input' | 'textarea' | 'table' | 'badge' | 'card' | 'tabs' | 'accordion' | 'codeblock' | 'alert' | 'layout' | 'breadcrumb' | 'icon' | 'mark';
type DocsSection = 'overview' | 'getting-started' | 'theming' | 'custom-components' | ComponentSection;
const componentFamilies: readonly { name: string; sections: readonly ComponentSection[] }[] = [
  { name: 'Controls', sections: ['button'] },
  { name: 'DataDisplay', sections: ['badge', 'codeblock', 'icon', 'mark', 'table'] },
  { name: 'Feedback', sections: ['alert'] },
  { name: 'Fields', sections: ['input', 'textarea'] },
  { name: 'Layout', sections: ['layout'] },
  { name: 'Navigation', sections: ['accordion', 'breadcrumb', 'tabs'] },
  { name: 'Surfaces', sections: ['card'] },
];

function Header() {
  return <Layout.Header className={styles.header}>
    <a className={styles.brand} href="/" aria-label="Dreadnought — на главную">
      <span className={styles.brandMark} aria-hidden="true">D</span>
      <span>Dreadnought</span>
    </a>
    <span className={styles.headerDivider} aria-hidden="true" />
    <span className={styles.headerSection}>Документация</span>
    <a className={styles.assistantLink} href="#docs-assistant">Помощник</a>
  </Layout.Header>;
}

function Sidebar({ section, knowledge }: { section: DocsSection; knowledge: ReturnType<typeof useKnowledge> }) {
  const [query, setQuery] = useState('');
  const results = searchKnowledge(knowledge.entries, query);

  return <Layout.Sidebar aria-label="Разделы документации" expandLabel="Открыть меню" collapseLabel="Свернуть меню">
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
      {componentFamilies.map((family) => <details key={family.name} className={styles.navigationFamily}
        open={section !== 'overview' && section !== 'getting-started' && section !== 'theming' && section !== 'custom-components' && family.sections.includes(section)}>
        <summary className={styles.familySummary}>{family.name}</summary>
        <div className={styles.familyLinks}>
          {family.sections.map((component) => <a key={component} className={styles.navigationLink}
            href={`/components/${component}/`} aria-current={section === component ? 'page' : undefined}>
            {componentDocs[component].title}
          </a>)}
        </div>
      </details>)}
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
  return <div className={styles.demo}>
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
  </div>;
}

function InputDemo() {
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <label htmlFor="demo-email">Электронная почта</label>
    <Input id="demo-email" type="email" name="demo-email" autoComplete="off" placeholder="name@example.com" />
    <label htmlFor="demo-password">Пароль</label>
    <Input id="demo-password" type="password" name="demo-password" autoComplete="new-password" passwordVisibilityLabels={{ show: 'Показать пароль', hide: 'Скрыть пароль' }} />
  </div>;
}

function TextAreaDemo() {
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <label htmlFor="demo-notes">Заметки</label>
    <TextArea id="demo-notes" name="demo-notes" rows={3} autoSize maxRows={8} placeholder="Введите текст…" />
  </div>;
}

const componentDocs: Record<ComponentSection, ComponentDoc> = {
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
    description: 'Однострочное поле с нативным вводом, состоянием ошибки и встроенным переключателем видимости пароля.',
    adapterDescription: 'Адаптер создаёт поле и кнопку пароля без оформления библиотеки.',
    logicDescription: 'Хук возвращает свойства поля и, для пароля, кнопки переключения видимости.',
    footnote: <>Поле принимает стандартные свойства <code>&lt;input&gt;</code>. <code>className</code> относится к обёртке; подпись задавайте через <code>&lt;label&gt;</code> или ARIA, а не через placeholder.</>,
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
    description: 'Структурированные данные с сортировкой, фильтрами, выбором строк, пагинацией и закреплением шапки и колонок.',
    adapterDescription: 'Адаптер сохраняет семантику и поведение таблицы, но позволяет оформить её самостоятельно.',
    logicDescription: 'Функции ядра обрабатывают строки данных, если нужна собственная разметка таблицы.',
    footnote: <>Для закреплённых колонок задайте <code>fixed</code> и числовую <code>width</code> в описании колонки. Ключ строки лучше задавать через <code>rowKey</code>.</>,
    demo: <TableDemo />,
  },
  badge: badgeDoc,
  card: cardDoc,
  tabs: tabsDoc,
  accordion: accordionDoc,
  codeblock: codeBlockDoc,
  alert: alertDoc,
  layout: layoutDoc,
  breadcrumb: breadcrumbDoc,
  icon: iconDoc,
  mark: markDoc,
};

const copyLabels = { copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' };

function ComponentDocumentation({ component }: { component: ComponentSection }) {
  const doc = componentDocs[component];
  return <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация', href: '/' }, { label: 'Компоненты' }, { label: doc.title }]} aria-label="Путь по документации" />
    <div data-knowledge id={`${component}-overview`} data-knowledge-title={doc.title}><PageHeading title={doc.title} description={doc.description} /></div>

    <section className={styles.section} aria-labelledby={`${component}-example`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-example`} className={styles.sectionTitle}>Пример</h2>
        <span className={styles.sectionMeta}>Готовый компонент</span>
      </div>
      {doc.demo}
      <CodeBlock code={doc.readyCode} language="tsx" copyLabels={copyLabels} />
    </section>

    <section data-knowledge className={styles.section} aria-labelledby={`${component}-layers`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-layers`} className={styles.sectionTitle}>Когда нужен другой слой</h2>
        <span className={styles.sectionMeta}>{doc.logicCode ? 'Один контракт · три уровня' : 'Готовый компонент · адаптер'}</span>
      </div>
      <div className={styles.layerExamples}>
        <div>
          <h3 className={styles.subheading}>Свои стили — адаптер</h3>
          <p className={styles.bodyText}>{doc.adapterDescription}</p>
          <div data-knowledge-exclude><CodeBlock code={doc.adapterCode} language="tsx" copyLabels={copyLabels} /></div>
        </div>
        {doc.logicCode && <div>
          <h3 className={styles.subheading}>Своя разметка — логика</h3>
          <p className={styles.bodyText}>{doc.logicDescription}</p>
          <div data-knowledge-exclude><CodeBlock code={doc.logicCode} language="tsx" copyLabels={copyLabels} /></div>
        </div>}
      </div>
    </section>

    <section className={styles.section} aria-labelledby={`${component}-api`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-api`} className={styles.sectionTitle}>Основные свойства</h2>
        <span className={styles.sectionMeta}>{doc.title}</span>
      </div>
      <div className={styles.tableScroll}>
        <Table className={styles.apiTable}>
          <Table.Head><Table.Row><Table.HeaderCell scope="col">Свойство</Table.HeaderCell><Table.HeaderCell scope="col">Значения</Table.HeaderCell><Table.HeaderCell scope="col">По умолчанию</Table.HeaderCell><Table.HeaderCell scope="col">Назначение</Table.HeaderCell></Table.Row></Table.Head>
          <Table.Body>{doc.apiRows.map(([name, values, fallback, meaning]) => <Table.Row key={name}><Table.HeaderCell scope="row"><code>{name}</code></Table.HeaderCell><Table.Cell><code>{values}</code></Table.Cell><Table.Cell>{fallback}</Table.Cell><Table.Cell>{meaning}</Table.Cell></Table.Row>)}</Table.Body>
        </Table>
      </div>
      <p data-knowledge data-knowledge-id={`${component}-api`} data-knowledge-title={`${doc.title}: примечания`} className={styles.footnote}>{doc.footnote}</p>
    </section>
  </article>;
}

export function DocsPage({ section }: { section: DocsSection }) {
  const knowledge = useKnowledge();
  return <Layout className={styles.shell}>
    <Header />
    <Layout direction="horizontal" className={styles.body}>
      <Sidebar section={section} knowledge={knowledge} />
      <Layout.Content className={styles.main}>
        <DocsContent section={section} />
        <aside id="docs-assistant" className={styles.assistantArea} aria-label="Помощник по документации">
          <DocsAssistant entries={knowledge.entries} loading={knowledge.loading} error={knowledge.error ?? undefined} />
        </aside>
      </Layout.Content>
    </Layout>
    <Layout.Footer className={styles.footer}>Dreadnought · Документация <span>Структура · Поведение · Тема</span></Layout.Footer>
  </Layout>;
}

function DocsContent({ section }: { section: DocsSection }) {
  if (section === 'overview') return <Overview />;
  if (section === 'getting-started') return <GettingStarted />;
  if (section === 'theming') return <ThemingGuide />;
  if (section === 'custom-components') return <CustomComponentsGuide />;
  return <ComponentDocumentation component={section} />;
}
