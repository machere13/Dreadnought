import { Breadcrumb, Button, Card } from '@dreadnought/ui/react';
import { DocsShell } from '../../app/DocsShell.tsx';
import { PageHeading } from '../../shared/PageHeading.tsx';
import styles from '../../shared/Documentation.module.css';

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

export function OverviewPage() {
  return <DocsShell section="overview"><Overview /></DocsShell>;
}
