import type { ReactNode } from 'react';
import { Layout } from '@dreadnought/ui/react';
import { useKnowledge } from '../data/knowledge/useKnowledge.ts';
import { DocsAssistant } from '../features/assistant/ui/DocsAssistant.tsx';
import { Header } from './Header.tsx';
import { Sidebar } from './Sidebar.tsx';
import { Footer } from './Footer.tsx';
import type { DocsSection } from './navigation.ts';
import styles from './DocsShell.module.css';

export function DocsShell({ section, children }: { section: DocsSection; children: ReactNode }) {
  const knowledge = useKnowledge();
  return (
    <Layout className={styles.shell}>
      <Header />
      <Layout direction="horizontal" className={styles.body}>
        <Sidebar section={section} knowledge={knowledge} />
        <Layout className={styles.contentColumn}>
          <Layout.Content className={styles.main}>{children}</Layout.Content>
          <Footer />
        </Layout>
      </Layout>
      <DocsAssistant
        entries={knowledge.entries}
        loading={knowledge.loading}
        error={knowledge.error ?? undefined}
      />
    </Layout>
  );
}
