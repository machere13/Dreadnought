import { useState } from 'react';
import { Badge, Breadcrumb, Button, Card, CodeBlock, Input, Layout, Table, TextArea } from '@dreadnought/ui/react';
import { badgeDoc } from './componentDocs/BadgeDoc';
import { cardDoc } from './componentDocs/CardDoc';
import { tabsDoc } from './componentDocs/TabsDoc';
import { accordionDoc } from './componentDocs/AccordionDoc';
import type { ComponentDoc } from './componentDocs/types';
import styles from './DocsPage.module.css';

type ComponentSection = 'button' | 'input' | 'textarea' | 'table' | 'badge' | 'card' | 'tabs' | 'accordion';
type DocsSection = 'overview' | ComponentSection;
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

const inputReadyCode = `import { Input } from '@dreadnought/ui/react';

<label htmlFor="email">Электронная почта</label>
<Input id="email" type="email" name="email" required />;`;

const inputAdapterCode = `import { InputAdapter } from '@dreadnought/react/unstyled';

<InputAdapter type="email" name="email" className={styles.myInput} />;`;

const inputLogicCode = `import { useInput } from '@dreadnought/react/logic';

const { inputProps, visibilityButtonProps } = useInput({ type: 'password' });
return <div><input {...inputProps} />{visibilityButtonProps && <button {...visibilityButtonProps} />}</div>;`;

const inputApiRows = [
  ['type', 'text | email | password | search | tel | url', 'text', 'Тип однострочного поля'],
  ['invalid', 'boolean', 'false', 'Помечает поле как ошибочное через aria-invalid'],
  ['passwordVisibilityLabels', '{ show, hide }', 'английские подписи', 'Доступные названия кнопки показа пароля'],
  ['passwordVisibilityContent', '{ show, hide }', 'иконки', 'Содержимое кнопки показа пароля'],
  ['disabled', 'boolean', 'false', 'Отключает поле и кнопку показа пароля'],
  ['readOnly', 'boolean', 'false', 'Запрещает редактирование'],
  ['required', 'boolean', 'false', 'Отмечает поле обязательным'],
] as const;

const textAreaReadyCode = `import { TextArea } from '@dreadnought/ui/react';

<label htmlFor="notes">Заметки</label>
<TextArea id="notes" name="notes" rows={3} autoSize maxRows={8} />;`;

const textAreaAdapterCode = `import { TextAreaAdapter } from '@dreadnought/react/unstyled';

<TextAreaAdapter rows={3} autoSize className={styles.myTextArea} />;`;

const textAreaLogicCode = `import { useTextArea } from '@dreadnought/react/logic';

const { textAreaProps, textAreaRef } = useTextArea({ rows: 3, autoSize: true });
return <textarea {...textAreaProps} ref={textAreaRef} />;`;

const textAreaApiRows = [
  ['rows', 'positive integer', '2', 'Начальная высота в строках'],
  ['minRows', 'positive integer', '—', 'Нижняя граница высоты'],
  ['maxRows', 'positive integer', '—', 'Верхняя граница высоты'],
  ['autoSize', 'boolean', 'false', 'Подстраивает высоту под содержимое'],
  ['invalid', 'boolean', 'false', 'Помечает поле как ошибочное через aria-invalid'],
  ['disabled', 'boolean', 'false', 'Отключает поле'],
  ['readOnly', 'boolean', 'false', 'Запрещает редактирование'],
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
      <a className={styles.navigationLink} href="/components/input/" aria-current={section === 'input' ? 'page' : undefined}>Input</a>
      <a className={styles.navigationLink} href="/components/textarea/" aria-current={section === 'textarea' ? 'page' : undefined}>TextArea</a>
      <a className={styles.navigationLink} href="/components/table/" aria-current={section === 'table' ? 'page' : undefined}>Table</a>
      <a className={styles.navigationLink} href="/components/badge/" aria-current={section === 'badge' ? 'page' : undefined}>Badge</a>
      <a className={styles.navigationLink} href="/components/card/" aria-current={section === 'card' ? 'page' : undefined}>Card</a>
      <a className={styles.navigationLink} href="/components/tabs/" aria-current={section === 'tabs' ? 'page' : undefined}>Tabs</a>
      <a className={styles.navigationLink} href="/components/accordion/" aria-current={section === 'accordion' ? 'page' : undefined}>Accordion</a>
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
  input: {
    title: 'Input',
    eyebrow: 'FIELDS / 01',
    description: 'Однострочное поле с нативным вводом, состоянием ошибки и встроенным переключателем видимости пароля.',
    readyCode: inputReadyCode,
    adapterCode: inputAdapterCode,
    logicCode: inputLogicCode,
    adapterDescription: 'Адаптер создаёт поле и кнопку пароля без оформления библиотеки.',
    logicDescription: 'Хук возвращает свойства поля и, для пароля, кнопки переключения видимости.',
    apiRows: inputApiRows,
    footnote: <>Поле принимает стандартные свойства <code>&lt;input&gt;</code>. <code>className</code> относится к обёртке; подпись задавайте через <code>&lt;label&gt;</code> или ARIA, а не через placeholder.</>,
    demo: <InputDemo />,
  },
  textarea: {
    title: 'TextArea',
    eyebrow: 'FIELDS / 02',
    description: 'Многострочное поле с ручным изменением высоты или автоматическим ростом по содержимому.',
    readyCode: textAreaReadyCode,
    adapterCode: textAreaAdapterCode,
    logicCode: textAreaLogicCode,
    adapterDescription: 'Адаптер сохраняет нативное поле и управление высотой, но не задаёт оформление.',
    logicDescription: <>При своей разметке передайте <code>textAreaRef</code> нативному элементу, чтобы работал autoSize.</>,
    apiRows: textAreaApiRows,
    footnote: <>Без <code>autoSize</code> поле можно растягивать мышью в пределах <code>minRows</code> и <code>maxRows</code>. С <code>autoSize</code> высота следует за текстом, а ручное растягивание отключено.</>,
    demo: <TextAreaDemo />,
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
  badge: badgeDoc,
  card: cardDoc,
  tabs: tabsDoc,
  accordion: accordionDoc,
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
        <span className={styles.sectionMeta}>{doc.logicCode ? 'Один контракт · три уровня' : 'Готовый компонент · адаптер'}</span>
      </div>
      <div className={styles.layerExamples}>
        <div>
          <h3 className={styles.subheading}>Свои стили — адаптер</h3>
          <p className={styles.bodyText}>{doc.adapterDescription}</p>
          <CodeBlock code={doc.adapterCode} language="tsx" copyLabels={copyLabels} />
        </div>
        {doc.logicCode && <div>
          <h3 className={styles.subheading}>Своя разметка — логика</h3>
          <p className={styles.bodyText}>{doc.logicDescription}</p>
          <CodeBlock code={doc.logicCode} language="tsx" copyLabels={copyLabels} />
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
