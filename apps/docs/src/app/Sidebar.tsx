import { Accordion, Layout, Menu } from '@dreadnought/ui/react';
import type { useKnowledge } from '../data/knowledge/useKnowledge.ts';
import { DocsSearch } from '../features/search/DocsSearch.tsx';
import { componentFamilies, componentTitles, coreTitles, type DocsSection } from './navigation.ts';
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
          <Menu
            className={styles.navigationMenu}
            mode="navigation"
            aria-label="Начало"
            selectedValue={section}
            items={[
              { value: 'overview', label: 'Обзор', href: '/' },
              { value: 'getting-started', label: 'Начало работы', href: '/getting-started/' },
              { value: 'theming', label: 'Тема и токены', href: '/theming/' },
              { value: 'custom-components', label: 'Свой компонент', href: '/custom-components/' },
            ]}
          />
          <span className={styles.navigationGroup}>Core</span>
          <Menu
            className={styles.navigationMenu}
            mode="navigation"
            aria-label="Core"
            selectedValue={section}
            items={Object.entries(coreTitles).map(([kind, title]) => ({
              value: `core-${kind}`,
              label: title,
              href: `/core/${kind}/`,
            }))}
          />
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
                <Accordion.Panel mountPolicy="lazy">
                  <Menu
                    className={styles.navigationMenu}
                    mode="navigation"
                    aria-label={`Компоненты ${family.name}`}
                    selectedValue={section}
                    items={family.sections.map((component) => ({
                      value: component,
                      label: componentTitles[component],
                      href: `/components/${component}/`,
                    }))}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </nav>
      </DocsSearch>
    </Layout.Sidebar>
  );
}
