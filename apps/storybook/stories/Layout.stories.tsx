import type { Meta, StoryObj } from '@storybook/react-vite';
import { Layout } from '@dreadnought/ui/react';
import styles from './Layout.stories.module.css';

type LayoutStoryArgs = { collapsed: boolean };

function DemoHeader({ section }: { section: string }) {
  return <Layout.Header>
    <div className={styles.headerContent}>
      <span className={styles.brand}><span className={styles.brandMark} aria-hidden="true">D</span>Dreadnought</span>
      <span className={styles.headerDivider} aria-hidden="true" />
      <span className={styles.headerSection}>{section}</span>
      <span className={styles.headerMeta}>UI · 0.1</span>
    </div>
  </Layout.Header>;
}

function DemoFooter() {
  return <Layout.Footer>
    <div className={styles.footerContent}>
      <span>Dreadnought UI</span>
      <span>Структура · Поведение · Тема</span>
    </div>
  </Layout.Footer>;
}

function DocumentationLayout({ collapsed }: LayoutStoryArgs) {
  return <Layout className={styles.shell}>
    <DemoHeader section="Документация" />
    <Layout direction="horizontal">
      <Layout.Sidebar key={String(collapsed)} defaultCollapsed={collapsed ? true : undefined} aria-label="Разделы документации">
        <nav aria-label="Страницы" className={styles.navigation}>
          <span className={styles.navigationLabel}>Разделы</span>
          <a className={styles.navigationLink} href="#overview">Обзор</a>
          <a className={`${styles.navigationLink} ${styles.navigationCurrent}`} href="#components" aria-current="page">Компоненты</a>
          <a className={styles.navigationLink} href="#tokens">Дизайн-токены</a>
        </nav>
      </Layout.Sidebar>
      <Layout.Content>
        <article className={styles.article}>
          <div className={styles.breadcrumb} id="overview">Документация <span aria-hidden="true">/</span> Компоненты</div>
          <h1 className={styles.title} id="components">Компоненты</h1>
          <p className={styles.lead}>Готовые элементы интерфейса с единым поведением. Подключите стандартную тему или настройте оформление под свой проект.</p>
          <section className={styles.detail} id="tokens" aria-label="Настройка оформления">
            <span className={styles.detailIndex}>01 / ОСНОВА</span>
            <h2 className={styles.detailTitle}>Дизайн-система — отдельно от логики</h2>
            <p className={styles.detailText}>Цвет, отступы и типографика задаются токенами. Поведение компонента остаётся прежним при смене темы.</p>
          </section>
        </article>
      </Layout.Content>
    </Layout>
    <DemoFooter />
  </Layout>;
}

const meta = {
  title: 'Layout/Layout',
  component: DocumentationLayout,
  args: { collapsed: false },
  argTypes: { collapsed: { control: 'boolean' } },
} satisfies Meta<typeof DocumentationLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LandingPage: Story = {
  render: () => <Layout className={styles.shell}>
    <DemoHeader section="Обзор" />
    <Layout.Content>
      <article className={styles.article}>
        <div className={styles.breadcrumb}>Библиотека интерфейса</div>
        <h1 className={styles.title}>Компоненты для разных дизайн-систем</h1>
        <p className={styles.lead}>Используйте готовые компоненты или соберите собственное представление на общей логике.</p>
      </article>
    </Layout.Content>
    <DemoFooter />
  </Layout>,
};

export const Documentation: Story = {};
export const CollapsedSidebar: Story = { args: { collapsed: true } };
