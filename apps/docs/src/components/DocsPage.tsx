import { useState } from 'react';
import { Badge, Breadcrumb, Button, Card, CodeBlock, Layout, Table } from '@dreadnought/ui/react';
import styles from './DocsPage.module.css';

type DocsSection = 'overview' | 'button';

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

const apiRows = [
  ['variant', 'primary | secondary | outlined | ghosted', 'primary', 'Внешний вид готовой кнопки'],
  ['size', 'default | compact', 'default', 'Размер кнопки'],
  ['icon', 'ReactNode', '—', 'Иконка рядом с текстом или без него'],
  ['iconPosition', 'start | end', 'start', 'Положение иконки'],
  ['href', 'string', '—', 'Создаёт ссылку вместо кнопки'],
  ['disabled', 'boolean', 'false', 'Блокирует действие'],
  ['loading', 'boolean', 'false', 'Блокирует действие, сохраняя фокус'],
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

function ButtonDocumentation() {
  return <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация', href: '/' }, { label: 'Компоненты' }, { label: 'Button' }]} aria-label="Путь по документации" />
    <PageHeading eyebrow="CONTROLS / 01" title="Button" description="Действие или ссылка с готовыми состояниями, доступной семантикой и оформлением, которое можно заменить без изменения поведения." />

    <section className={styles.section} aria-labelledby="button-example">
      <div className={styles.sectionHeading}>
        <h2 id="button-example" className={styles.sectionTitle}>Пример</h2>
        <span className={styles.sectionMeta}>Готовый компонент</span>
      </div>
      <ButtonDemo />
      <CodeBlock code={readyCode} language="tsx" copyLabels={{ copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' }} />
    </section>

    <section className={styles.section} aria-labelledby="button-layers">
      <div className={styles.sectionHeading}>
        <h2 id="button-layers" className={styles.sectionTitle}>Когда нужен другой слой</h2>
        <span className={styles.sectionMeta}>Один контракт · три уровня</span>
      </div>
      <div className={styles.layerExamples}>
        <div>
          <h3 className={styles.subheading}>Свои стили — адаптер</h3>
          <p className={styles.bodyText}>Адаптер создаёт нативный элемент и управляет его состояниями, но не подключает тему.</p>
          <CodeBlock code={adapterCode} language="tsx" copyLabels={{ copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' }} />
        </div>
        <div>
          <h3 className={styles.subheading}>Своя разметка — логика</h3>
          <p className={styles.bodyText}>Хук возвращает свойства для собственного нативного <code>&lt;button&gt;</code>.</p>
          <CodeBlock code={logicCode} language="tsx" copyLabels={{ copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' }} />
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="button-api">
      <div className={styles.sectionHeading}>
        <h2 id="button-api" className={styles.sectionTitle}>Основные свойства</h2>
        <span className={styles.sectionMeta}>Button</span>
      </div>
      <div className={styles.tableScroll}>
        <Table className={styles.apiTable}>
          <Table.Head><Table.Row><Table.HeaderCell scope="col">Свойство</Table.HeaderCell><Table.HeaderCell scope="col">Значения</Table.HeaderCell><Table.HeaderCell scope="col">По умолчанию</Table.HeaderCell><Table.HeaderCell scope="col">Назначение</Table.HeaderCell></Table.Row></Table.Head>
          <Table.Body>{apiRows.map(([name, values, fallback, meaning]) => <Table.Row key={name}><Table.HeaderCell scope="row"><code>{name}</code></Table.HeaderCell><Table.Cell><code>{values}</code></Table.Cell><Table.Cell>{fallback}</Table.Cell><Table.Cell>{meaning}</Table.Cell></Table.Row>)}</Table.Body>
        </Table>
      </div>
      <p className={styles.footnote}>Поддерживаются также стандартные свойства <code>&lt;button&gt;</code> и <code>&lt;a&gt;</code>. Для кнопки только с иконкой задайте доступное имя через <code>aria-label</code>.</p>
    </section>
  </article>;
}

export function DocsPage({ section }: { section: DocsSection }) {
  return <Layout className={styles.shell}>
    <Header />
    <Layout direction="horizontal" className={styles.body}>
      <Sidebar section={section} />
      <Layout.Content className={styles.main}>
        {section === 'button' ? <ButtonDocumentation /> : <Overview />}
      </Layout.Content>
    </Layout>
    <Layout.Footer className={styles.footer}>Dreadnought · Документация <span>Структура · Поведение · Тема</span></Layout.Footer>
  </Layout>;
}
