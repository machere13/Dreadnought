import { useState } from 'react';
import type { ReactNode } from 'react';
import { Badge, Breadcrumb, Button, Card, CodeBlock, Layout, Table } from '@dreadnought/ui/react';
import styles from './DocsPage.module.css';

type ComponentSection = 'button' | 'table';
type DocsSection = 'overview' | ComponentSection;
type ApiRow = readonly [name: string, values: string, fallback: string, meaning: string];
type ComponentDoc = {
  title: string;
  eyebrow: string;
  description: string;
  readyCode: string;
  adapterCode: string;
  logicCode: string;
  adapterDescription: string;
  logicDescription: ReactNode;
  apiRows: readonly ApiRow[];
  footnote: ReactNode;
  demo: ReactNode;
};

const readyCode = `import { Button } from '@dreadnought/ui/react';

<Button onClick={() => console.log('Нажато')}>
  Сохранить
</Button>`;

const adapterCode = `import { ButtonAdapter } from '@dreadnought/react/unstyled';

<ButtonAdapter className={styles.myButton}>
  Сохранить
</ButtonAdapter>`;

const logicCode = `import { useButton } from '@dreadnought/react/logic';

const { buttonProps } = useButton({ disabled: false });
return <button {...buttonProps}>Сохранить</button>;`;

const buttonApiRows = [
  ['variant', 'primary | secondary | outlined | ghosted', 'primary', 'Внешний вид готовой кнопки'],
  ['size', 'default | compact', 'default', 'Размер кнопки'],
  ['icon', 'ReactNode', '—', 'Иконка рядом с текстом или без него'],
  ['iconPosition', 'start | end', 'start', 'Положение иконки'],
  ['href', 'string', '—', 'Создаёт ссылку вместо кнопки'],
  ['disabled', 'boolean', 'false', 'Блокирует действие'],
  ['loading', 'boolean', 'false', 'Блокирует действие, сохраняя фокус'],
] as const;

const tableReadyCode = `import { Table } from '@dreadnought/ui/react';

<Table
  rowKey="id"
  dataSource={[{ id: 1, name: 'Борис' }, { id: 2, name: 'Анна' }]}
  columns={[{ key: 'name', title: 'Имя', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) }]}
/>;`;

const tableAdapterCode = `import { TableAdapter } from '@dreadnought/react/unstyled';

<TableAdapter
  rowKey="id"
  dataSource={people}
  columns={columns}
  className={styles.myTable}
/>;`;

const tableLogicCode = `import { sortTableRows } from '@dreadnought/core';

const sorted = sortTableRows(people, (a, b) => a.name.localeCompare(b.name), 'ascend');
return <table><tbody>{sorted.map((person) => <tr key={person.id}><td>{person.name}</td></tr>)}</tbody></table>;`;

const tableApiRows = [
  ['columns', 'TableColumn[]', '—', 'Колонки, отображение ячеек, сортировка и фильтры'],
  ['dataSource', 'RecordType[]', '—', 'Строки таблицы'],
  ['rowKey', 'keyof RecordType | function', 'index', 'Устойчивый ключ строки'],
  ['pagination', 'false | TablePagination', '10 строк', 'Разбиение на страницы'],
  ['rowSelection', 'TableRowSelection', '—', 'Выбор строк'],
  ['sticky', 'boolean | { offsetHeader }', 'false', 'Закреплённая шапка'],
  ['scroll', '{ x?, y? }', '—', 'Прокрутка и ширина таблицы'],
  ['onChange', 'function', '—', 'Изменения сортировки, фильтров и страницы'],
  ['size', 'default | middle | small', 'default', 'Плотность готовой таблицы'],
  ['bordered', 'boolean', 'false', 'Рамка и разделители колонок'],
] as const;

function Header() {
  return <Layout.Header className={styles.header}>
    <a className={styles.brand} href="/" aria-label="Dreadnought — на главную">
      <span className={styles.brandMark} aria-hidden="true">D</span>
      <span>Dreadnought</span>
    </a>
    <span className={styles.headerDivider} aria-hidden="true" />
    <span className={styles.headerSection}>Документация</span>
    <Badge appearance="ghosted" className={styles.version}>v0.1</Badge>
  </Layout.Header>;
}

function Sidebar({ section }: { section: DocsSection }) {
  return <Layout.Sidebar aria-label="Разделы документации" expandLabel="Открыть меню" collapseLabel="Свернуть меню">
    <nav className={styles.navigation} aria-label="Страницы документации">
      <span className={styles.navigationGroup}>Начало</span>
      <a className={styles.navigationLink} href="/" aria-current={section === 'overview' ? 'page' : undefined}>Обзор</a>
      <span className={styles.navigationGroup}>Компоненты</span>
      <a className={styles.navigationLink} href="/components/button/" aria-current={section === 'button' ? 'page' : undefined}>Button</a>
      <a className={styles.navigationLink} href="/components/table/" aria-current={section === 'table' ? 'page' : undefined}>Table</a>
    </nav>
  </Layout.Sidebar>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className={styles.pageHeading}>
    <span className={styles.eyebrow}>{eyebrow}</span>
    <h1 className={styles.title}>{title}</h1>
    <p className={styles.lead}>{description}</p>
  </div>;
}

function Overview() {
  return <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация' }, { label: 'Обзор' }]} aria-label="Путь по документации" />
    <PageHeading eyebrow="БИБЛИОТЕКА КОМПОНЕНТОВ" title="Начните с готового компонента" description="Dreadnought объединяет общую логику, адаптеры под фреймворк и оформленные компоненты. Берите ровно тот слой, который нужен вашему проекту." />
    <section className={styles.section} aria-labelledby="overview-layers">
      <h2 id="overview-layers" className={styles.sectionTitle}>Три уровня использования</h2>
      <div className={styles.layerList} role="list" aria-label="Три уровня использования">
        <Card role="listitem" className={styles.layerCard}><strong>Готовый компонент</strong><span>Подключайте с темой и меняйте внешний вид через токены.</span></Card>
        <Card role="listitem" className={styles.layerCard}><strong>Адаптер</strong><span>Оставляйте разметку и поведение, задавая свои стили.</span></Card>
        <Card role="listitem" className={styles.layerCard}><strong>Логика</strong><span>Собирайте собственный компонент на базовом поведении.</span></Card>
      </div>
      <Button href="/components/button/" className={styles.overviewAction}>Посмотреть Button</Button>
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

const componentDocs: Record<ComponentSection, ComponentDoc> = {
  button: {
    title: 'Button',
    eyebrow: 'CONTROLS / 01',
    description: 'Действие или ссылка с готовыми состояниями, доступной семантикой и оформлением, которое можно заменить без изменения поведения.',
    readyCode,
    adapterCode,
    logicCode,
    adapterDescription: 'Адаптер создаёт нативный элемент и управляет его состояниями, но не подключает тему.',
    logicDescription: <>Хук возвращает свойства для собственного нативного <code>&lt;button&gt;</code>.</>,
    apiRows: buttonApiRows,
    footnote: <>Поддерживаются также стандартные свойства <code>&lt;button&gt;</code> и <code>&lt;a&gt;</code>. Для кнопки только с иконкой задайте доступное имя через <code>aria-label</code>.</>,
    demo: <ButtonDemo />,
  },
  table: {
    title: 'Table',
    eyebrow: 'DATA DISPLAY / 01',
    description: 'Структурированные данные с сортировкой, фильтрами, выбором строк, пагинацией и закреплением шапки и колонок.',
    readyCode: tableReadyCode,
    adapterCode: tableAdapterCode,
    logicCode: tableLogicCode,
    adapterDescription: 'Адаптер сохраняет семантику и поведение таблицы, но позволяет оформить её самостоятельно.',
    logicDescription: 'Функции ядра обрабатывают строки данных, если нужна собственная разметка таблицы.',
    apiRows: tableApiRows,
    footnote: <>Для закреплённых колонок задайте <code>fixed</code> и числовую <code>width</code> в описании колонки. Ключ строки лучше задавать через <code>rowKey</code>.</>,
    demo: <TableDemo />,
  },
};

const copyLabels = { copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' };

function ComponentDocumentation({ component }: { component: ComponentSection }) {
  const doc = componentDocs[component];
  return <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация', href: '/' }, { label: 'Компоненты' }, { label: doc.title }]} aria-label="Путь по документации" />
    <PageHeading eyebrow={doc.eyebrow} title={doc.title} description={doc.description} />

    <section className={styles.section} aria-labelledby={`${component}-example`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-example`} className={styles.sectionTitle}>Пример</h2>
        <span className={styles.sectionMeta}>Готовый компонент</span>
      </div>
      {doc.demo}
      <CodeBlock code={doc.readyCode} language="tsx" copyLabels={copyLabels} />
    </section>

    <section className={styles.section} aria-labelledby={`${component}-layers`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-layers`} className={styles.sectionTitle}>Когда нужен другой слой</h2>
        <span className={styles.sectionMeta}>Один контракт · три уровня</span>
      </div>
      <div className={styles.layerExamples}>
        <div>
          <h3 className={styles.subheading}>Свои стили — адаптер</h3>
          <p className={styles.bodyText}>{doc.adapterDescription}</p>
          <CodeBlock code={doc.adapterCode} language="tsx" copyLabels={copyLabels} />
        </div>
        <div>
          <h3 className={styles.subheading}>Своя разметка — логика</h3>
          <p className={styles.bodyText}>{doc.logicDescription}</p>
          <CodeBlock code={doc.logicCode} language="tsx" copyLabels={copyLabels} />
        </div>
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
      <p className={styles.footnote}>{doc.footnote}</p>
    </section>
  </article>;
}

export function DocsPage({ section }: { section: DocsSection }) {
  return <Layout className={styles.shell}>
    <Header />
    <Layout direction="horizontal" className={styles.body}>
      <Sidebar section={section} />
      <Layout.Content className={styles.main}>
        {section === 'overview' ? <Overview /> : <ComponentDocumentation component={section} />}
      </Layout.Content>
    </Layout>
    <Layout.Footer className={styles.footer}>Dreadnought · Документация <span>Структура · Поведение · Тема</span></Layout.Footer>
  </Layout>;
}
