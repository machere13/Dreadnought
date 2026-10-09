import { Layout } from '@dreadnought/ui/react';
import styles from './DocsShell.module.css';

export function Header() {
  return (
    <Layout.Header className={styles.header}>
      <h4 className={styles.brand}>
        <a href="/" title="На главную">
          Dreadnought
        </a>
      </h4>
    </Layout.Header>
  );
}
