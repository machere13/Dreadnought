import { Accordion, Layout } from '@dreadnought/ui/react';
import type { useKnowledge } from '../data/knowledge/useKnowledge.ts';
import { DocsSearch } from '../features/search/DocsSearch.tsx';
import { componentFamilies, componentTitles, type DocsSection } from './navigation.ts';
import styles from './DocsShell.module.css';

export function Sidebar({
  section,
  knowledge,
}: {
  section: DocsSection;
  knowledge: ReturnType<typeof useKnowledge>;
}) {
  return (
    <Layout.Sidebar
      className={styles.sidebar}
      slotClassNames={{ body: styles.sidebarBody }}
      aria-label="Разделы документации"
      expandLabel="Открыть меню"
      collapseLabel="Свернуть меню"
    >
      <DocsSearch knowledge={knowledge}>
        <nav className={styles.navigation} aria-label="Страницы документации">
          <span className={styles.navigationGroup}>Начало</span>
          <a
            className={styles.navigationLink}
            href="/"
            aria-current={section === 'overview' ? 'page' : undefined}
          >
            Обзор
          </a>
          <a
            className={styles.navigationLink}
            href="/getting-started/"
            aria-current={section === 'getting-started' ? 'page' : undefined}
          >
            Начало работы
          </a>
          <a
            className={styles.navigationLink}
            href="/theming/"
            aria-current={section === 'theming' ? 'page' : undefined}
          >
            Тема и токены
          </a>
          <a
            className={styles.navigationLink}
            href="/custom-components/"
            aria-current={section === 'custom-components' ? 'page' : undefined}
          >
            Свой компонент
          </a>
          <span className={styles.navigationGroup}>Компоненты</span>
          <Accordion
            key={section}
            multiple
            className={styles.navigationFamilies}
            defaultValue={componentFamilies
              .filter((family) => family.sections.some((component) => component === section))
              .map((family) => family.name)}
          >
            {componentFamilies.map((family) => (
              <Accordion.Item key={family.name} value={family.name}>
                <Accordion.Trigger headingLevel={2}>{family.name}</Accordion.Trigger>
                <Accordion.Panel className={styles.familyLinks}>
                  {family.sections.map((component) => (
                    <a
                      key={component}
                      className={styles.navigationLink}
                      href={`/components/${component}/`}
                      aria-current={section === component ? 'page' : undefined}
                    >
                      {componentTitles[component]}
                    </a>
                  ))}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </nav>
      </DocsSearch>
    </Layout.Sidebar>
  );
}
